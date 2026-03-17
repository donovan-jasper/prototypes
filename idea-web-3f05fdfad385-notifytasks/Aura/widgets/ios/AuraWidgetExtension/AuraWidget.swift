import WidgetKit
import SwiftUI

struct AuraWidget: Widget {
    let kind: String = "AuraWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            AuraWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Aura Widget")
        .description("Quickly view and manage your tasks.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), tasks: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), tasks: fetchTasks())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        var entries: [SimpleEntry] = []

        let tasks = fetchTasks()
        let entry = SimpleEntry(date: Date(), tasks: tasks)
        entries.append(entry)

        let timeline = Timeline(entries: entries, policy: .after(Date().addingTimeInterval(300)))
        completion(timeline)
    }

    private func fetchTasks() -> [Task] {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.yourcompany.aura") else {
            return []
        }
        
        guard let tasksData = sharedDefaults.data(forKey: "AURA_WIDGET_DATA"),
              let tasksArray = try? JSONDecoder().decode([Task].self, from: tasksData) else {
            return []
        }
        
        return tasksArray
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let tasks: [Task]
}

struct Task: Identifiable, Codable {
    let id: Int
    let content: String
    let type: String
    let isCompleted: Bool
}

struct AuraWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Aura")
                .font(.headline)
                .foregroundColor(.purple)
                .padding(.bottom, 4)
            
            if entry.tasks.isEmpty {
                Text("No active tasks")
                    .font(.caption)
                    .foregroundColor(.gray)
            } else {
                ForEach(entry.tasks.prefix(5)) { task in
                    HStack(spacing: 8) {
                        Button(intent: CompleteTaskIntent(taskId: task.id)) {
                            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(task.isCompleted ? .green : .gray)
                        }
                        .buttonStyle(.plain)
                        
                        Text(task.content)
                            .font(.caption)
                            .lineLimit(1)
                            .strikethrough(task.isCompleted)
                            .foregroundColor(task.isCompleted ? .gray : .primary)
                    }
                }
            }
            
            Spacer()
            
            Link("Add Task", destination: URL(string: "aura://add-task")!)
                .font(.caption)
                .foregroundColor(.purple)
        }
        .padding()
    }
}

struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    @Parameter(title: "Task ID")
    var taskId: Int
    
    init(taskId: Int) {
        self.taskId = taskId
    }
    
    init() {
        self.taskId = 0
    }
    
    func perform() async throws -> some IntentResult {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.yourcompany.aura") else {
            return .result()
        }
        
        if let tasksData = sharedDefaults.data(forKey: "AURA_WIDGET_DATA"),
           var tasks = try? JSONDecoder().decode([Task].self, from: tasksData) {
            
            if let index = tasks.firstIndex(where: { $0.id == taskId }) {
                tasks[index] = Task(
                    id: tasks[index].id,
                    content: tasks[index].content,
                    type: tasks[index].type,
                    isCompleted: !tasks[index].isCompleted
                )
                
                if let updatedData = try? JSONEncoder().encode(tasks) {
                    sharedDefaults.set(updatedData, forKey: "AURA_WIDGET_DATA")
                }
            }
        }
        
        WidgetCenter.shared.reloadAllTimelines()
        
        return .result()
    }
}

@main
struct AuraWidgetBundle: WidgetBundle {
    var body: some Widget {
        AuraWidget()
    }
}
