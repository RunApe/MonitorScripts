**Integrations**
==================================================

If you need be notified about the webpage changes in other ways than the [Alert Email](https://runape.com/Docs/UserGuide/alert_emails.htm) :blue_book: then you can our available integrations.

A common integration scenario involves a monitor running a monitor script (*Integration Monitor*) that is [triggered by a monitor](https://runape.com/Docs/UserGuide/schedule_and_triggers.htm#id_5) :blue_book: whose changes we want to be notified about. The Integration Monitor collects detected changes using the RunApe [API](https://github.com/RunApe/MonitorScripts/tree/master/node_modules#comapijs) and forwards these to different services. In addition, the Integration Monitor can write the results to its HTML and together with [Compare Page enabled](https://runape.com/Docs/UserGuide/monitor_script.htm#id_4) :blue_book: have the content version saved and changes sent to you via the Alert Email.
 
![img](https://github.com/RunApe/MediaFiles/raw/master/Git/Integrations.png)