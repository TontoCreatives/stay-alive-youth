# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in C:\Users\ST. ANDREWS COLLEGE\AppData\Local\Android\Sdk\tools\proguard\proguard-android.txt

# ==========================================
# CAPACITOR CORE - required, do not remove
# ==========================================
-keep class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keepclassmembers class * extends com.getcapacitor.Plugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class *

# WebView JavaScript bridge — critical, breaks native<->JS communication if removed
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keep public class * extends android.webkit.WebViewClient
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ==========================================
# CAPGO LIVE UPDATER - required for OTA to keep working
# ==========================================
-keep class ee.forgr.capacitor_updater.** { *; }

# ==========================================
# FIREBASE PUSH NOTIFICATIONS
# ==========================================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# ==========================================
# GENERAL SAFETY
# ==========================================
# Keep line numbers for readable crash reports if something does go wrong
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile