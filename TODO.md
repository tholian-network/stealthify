
# TODO

- [ ] Use chrome.tabs.query() to get all Tabs, and map them to stealth/source/Tab instances with the same history[] maps
- [ ] chrome.tabs.query({ currentWindow: true, active: true }) returns the currently active Tab
- [ ] Use the `request` listener in Interceptor to modify the `stealthify.tabs[].find((t) => t.id === details.tabId)`'s domain list
- [ ] Integrate `mode{}` and `power{}` to the Tab via Interceptor
- [ ] Implement `getPower(link)` that returns `{ cookies: false, javascript: false }`
- [ ] Implement `setPower(power)` that calls `storage.save()` afterwards

- [ ] Implement `Toggle` card for both `mode` and `power` in a single line


# Planned Features

- [ ] Implement Toggle buttons for current domain and subdomains
- [ ] Implement Toggle Buttons for CDNs
- [ ] Implement Toggle Buttons for known Services (like PayPal)

