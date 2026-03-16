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
        let entry = SimpleEntry(date: Date(), tasks: [])
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Fetch tasks from shared data or App Groups
        let tasks = fetchTasks()

        let entry = SimpleEntry(date: Date(), tasks: tasks)
        entries.append(entry)

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

    private func fetchTasks() -> [Task] {
        // Implement task fetching logic here
        return []
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let tasks: [Task]
}

struct Task: Identifiable {
    let id: Int
    let content: String
    let type: String
    let isCompleted: Bool
}

struct AuraWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack {
            ForEach(entry.tasks) { task in
                Text(task.content)
            }
        }
    }
}

@main
struct AuraWidgetBundle: WidgetBundle {
    var body: some Widget {
        AuraWidget()
    }
}
