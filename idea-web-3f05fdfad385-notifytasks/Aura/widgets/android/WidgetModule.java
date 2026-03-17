package com.yourcompany.aura;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

public class WidgetModule extends AppWidgetProvider {
    private static final String ACTION_COMPLETE_TASK = "com.yourcompany.aura.COMPLETE_TASK";
    private static final String EXTRA_TASK_ID = "task_id";
    private static final String PREFS_NAME = "AuraWidgetPrefs";
    private static final String WIDGET_DATA_KEY = "AURA_WIDGET_DATA";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String tasksJson = prefs.getString(WIDGET_DATA_KEY, "[]");

        try {
            JSONArray tasksArray = new JSONArray(tasksJson);
            
            views.removeAllViews(R.id.widget_task_list);
            
            int taskCount = Math.min(tasksArray.length(), 5);
            for (int i = 0; i < taskCount; i++) {
                JSONObject task = tasksArray.getJSONObject(i);
                int taskId = task.getInt("id");
                String content = task.getString("content");
                boolean isCompleted = task.getBoolean("isCompleted");

                RemoteViews taskView = new RemoteViews(context.getPackageName(), R.layout.widget_task_item);
                taskView.setTextViewText(R.id.task_content, content);
                taskView.setImageViewResource(R.id.task_checkbox, 
                    isCompleted ? R.drawable.ic_check_circle : R.drawable.ic_circle);

                Intent completeIntent = new Intent(context, WidgetModule.class);
                completeIntent.setAction(ACTION_COMPLETE_TASK);
                completeIntent.putExtra(EXTRA_TASK_ID, taskId);
                completeIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);

                PendingIntent completePendingIntent = PendingIntent.getBroadcast(
                    context, 
                    taskId, 
                    completeIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                taskView.setOnClickPendingIntent(R.id.task_checkbox, completePendingIntent);

                views.addView(R.id.widget_task_list, taskView);
            }

            if (taskCount == 0) {
                RemoteViews emptyView = new RemoteViews(context.getPackageName(), R.layout.widget_empty);
                views.addView(R.id.widget_task_list, emptyView);
            }

            Intent addTaskIntent = new Intent(Intent.ACTION_VIEW);
            addTaskIntent.setData(android.net.Uri.parse("aura://add-task"));
            PendingIntent addTaskPendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                addTaskIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_add_button, addTaskPendingIntent);

        } catch (Exception e) {
            e.printStackTrace();
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        if (ACTION_COMPLETE_TASK.equals(intent.getAction())) {
            int taskId = intent.getIntExtra(EXTRA_TASK_ID, -1);
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1);

            if (taskId != -1) {
                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String tasksJson = prefs.getString(WIDGET_DATA_KEY, "[]");

                try {
                    JSONArray tasksArray = new JSONArray(tasksJson);
                    
                    for (int i = 0; i < tasksArray.length(); i++) {
                        JSONObject task = tasksArray.getJSONObject(i);
                        if (task.getInt("id") == taskId) {
                            task.put("isCompleted", !task.getBoolean("isCompleted"));
                            break;
                        }
                    }

                    prefs.edit().putString(WIDGET_DATA_KEY, tasksArray.toString()).apply();

                    AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                    if (appWidgetId != -1) {
                        updateAppWidget(context, appWidgetManager, appWidgetId);
                    } else {
                        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(
                            new android.content.ComponentName(context, WidgetModule.class)
                        );
                        onUpdate(context, appWidgetManager, appWidgetIds);
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
