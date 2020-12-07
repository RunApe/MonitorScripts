**Integrations**
==================================================

If you need be notified about the webpage changes in other ways than the [Alert Email](https://runape.com/Docs/UserGuide/alert_emails.htm) :blue_book: then you can use many of our integrations available.

A common integration scenario involves a monitor running a monitor script (from here on called *Integration Monitor*) that collects detected changes using the RunApe [API](https://github.com/RunApe/MonitorScripts/tree/master/node_modules#comapijs). The Integration Monitor then filters the detected changes using the [ChangesAPI](https://github.com/RunApe/MonitorScripts/tree/master/node_modules#changesapijs) and sends the prepared data to any other service. The Integration Monitor can be [triggered by any monitors](https://runape.com/Docs/UserGuide/schedule_and_triggers.htm#id_5) :blue_book: when they detect new changes on the web. In addition, the Integration Monitor can output its results to the loaded HTML and together with [Compare Page enabled](https://runape.com/Docs/UserGuide/monitor_script.htm#id_4) :blue_book: have the content version saved and changes sent to you via the Alert Email.
 

![img](https://runape.com/Docs/Media/Integrations.png)
