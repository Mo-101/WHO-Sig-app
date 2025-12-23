"use client"

import { useState, useEffect } from "react"
import { Bell, X, Settings } from "lucide-react"
import type { WHOEvent } from "@/lib/who-data"

interface Notification {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  event?: WHOEvent
  timestamp: Date
  read: boolean
}

interface NotificationCenterProps {
  events: WHOEvent[]
}

export function NotificationCenter({ events }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("who-notification-settings")
      return saved
        ? JSON.parse(saved)
        : {
            enableBrowser: true,
            enableSound: true,
            grade3: true,
            grade2: true,
            grade1: false,
            criticalOnly: false,
          }
    }
    return {
      enableBrowser: true,
      enableSound: true,
      grade3: true,
      grade2: true,
      grade1: false,
      criticalOnly: false,
    }
  })

  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
    }
  }

  const playNotificationSound = () => {
    if (settings.enableSound) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const showBrowserNotification = (notification: Notification) => {
    if (settings.enableBrowser && permission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      })
    }
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50))
    playNotificationSound()
    showBrowserNotification(newNotification)
  }

  useEffect(() => {
    const checkForNewEvents = () => {
      events.forEach((event) => {
        const eventDate = new Date(event.reportDate)
        const now = new Date()
        const hoursDiff = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < 24) {
          const shouldNotify =
            (settings.grade3 && event.grade === "Grade 3") ||
            (settings.grade2 && event.grade === "Grade 2") ||
            (settings.grade1 && event.grade === "Grade 1")

          if (shouldNotify) {
            const existingNotification = notifications.find((n) => n.event?.id === event.id)
            if (!existingNotification) {
              const type = event.grade === "Grade 3" ? "critical" : event.grade === "Grade 2" ? "warning" : "info"
              addNotification({
                type,
                title: `${event.grade} Alert: ${event.country}`,
                message: `${event.disease} - ${event.eventType}. ${event.cases || 0} cases reported.`,
                event,
              })
            }
          }
        }
      })
    }

    checkForNewEvents()
    const interval = setInterval(checkForNewEvents, 60000)
    return () => clearInterval(interval)
  }, [events, settings])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const updateSettings = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    if (typeof window !== "undefined") {
      localStorage.setItem("who-notification-settings", JSON.stringify(newSettings))
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative bg-[#e8eef5] p-2.5 rounded-xl neu-shadow hover:bg-white/50 transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-[#0056b3]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff3355] text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-[#e8eef5] rounded-2xl neu-shadow z-50 flex flex-col">
          <div className="p-4 border-b border-[#d1d9e6] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0056b3]">Notifications ({unreadCount} unread)</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-[#6a7a94] hover:text-[#0056b3] transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="text-[#6a7a94] hover:text-[#0056b3] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showSettings ? (
            <div className="p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0056b3] uppercase tracking-wide mb-2">Notification Settings</h4>

              {permission !== "granted" && (
                <button
                  onClick={requestPermission}
                  className="w-full px-3 py-2 bg-[#009edb] text-white text-xs font-semibold rounded-lg hover:bg-[#0056b3] transition-colors"
                >
                  Enable Browser Notifications
                </button>
              )}

              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-xs text-[#2c3e50]">Browser Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.enableBrowser}
                    onChange={(e) => updateSettings("enableBrowser", e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-xs text-[#2c3e50]">Sound Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => updateSettings("enableSound", e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>

                <div className="border-t border-[#d1d9e6] pt-2 mt-2">
                  <p className="text-[10px] font-bold text-[#6a7a94] uppercase tracking-wide mb-2">Alert Grades</p>

                  <label className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#2c3e50]">Grade 3 (Critical)</span>
                    <input
                      type="checkbox"
                      checked={settings.grade3}
                      onChange={(e) => updateSettings("grade3", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#2c3e50]">Grade 2 (High)</span>
                    <input
                      type="checkbox"
                      checked={settings.grade2}
                      onChange={(e) => updateSettings("grade2", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-xs text-[#2c3e50]">Grade 1 (Medium)</span>
                    <input
                      type="checkbox"
                      checked={settings.grade1}
                      onChange={(e) => updateSettings("grade1", e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-3 py-2 bg-[#e8eef5] text-[#2c3e50] text-xs font-semibold rounded-lg hover:bg-[#d1d9e6] transition-colors neu-shadow"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {notifications.length > 0 && (
                <div className="p-2 border-b border-[#d1d9e6] flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="flex-1 px-3 py-1.5 text-[10px] bg-[#009edb] text-white rounded hover:bg-[#0056b3] transition-colors"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 px-3 py-1.5 text-[10px] bg-[#ff3355] text-white rounded hover:bg-[#ff0033] transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-[#d1d9e6] mx-auto mb-2" />
                    <p className="text-xs text-[#6a7a94]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg transition-all ${
                        notification.read ? "bg-white/30" : "bg-white/60 neu-shadow"
                      } ${
                        notification.type === "critical"
                          ? "border-l-4 border-[#ff3355]"
                          : notification.type === "warning"
                            ? "border-l-4 border-[#ff9933]"
                            : "border-l-4 border-[#009edb]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-xs font-bold text-[#2c3e50]">{notification.title}</h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-[#6a7a94] hover:text-[#ff3355] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#5a6a7a] mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[#6a7a94]">{notification.timestamp.toLocaleTimeString()}</span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-[9px] text-[#009edb] hover:text-[#0056b3] font-semibold transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
