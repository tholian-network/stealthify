
# TODO

- [ ] Implement `Tab` to reflect a list of currently displayed `domains[]`.
- [ ] `Tab{id}` has to be the `details.tabId` from `chrome.tabs.query()` API.
- [ ] Use chrome.tabs.query() to get all Tabs, and map them to stealth/source/Tab instances with the same history[] maps
- [ ] chrome.tabs.query({ currentWindow: true, active: true }) returns the currently active Tab

- [ ] Integrate redirects so that `/stealth/:tabid:/` is used.
- [ ] Use the `request` listener in Interceptor to modify the `stealthify.tabs[].find((t) => t.id === details.tabId)`'s domain list

