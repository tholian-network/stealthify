
# Stealthify Extension for Chrome/Chromium

This Web Extension is a Proxy Extension that will allow to use [Stealth](https://github.com/tholian-network/stealth)
as an HTTP/S Proxy inside a Chromium-based Web Browser.


## Features

The Features are delegated through Stealth and are therefore on feature-parity
with it, except for all the Automation related parts.

This Extension offers a `Popup` that allows to quickly configure the `Site Modes`
and `Site Powers` for all the resources on the currently displayed Tab.

- It uses `Site Modes` that decide what to load, with incrementally allowed features
  (or media types). By default, Stealth will load nothing. The Site Mode decides
  what is being loaded.

- It uses `Site Powers` that decide whether or not a Site is allowed to use
  `Cookies` and allowed to execute `JavaScript`.

- It offers an `Open in Incognito Tab` button that allows to open the currently
  displayed Site in an isolated Sandbox.


## Limitations

The Chromium `Manifest V3` still has no replacement for the [webRequest API](https://developer.chrome.com/docs/extensions/reference/webRequest)
because the [declarativeWebRequest API](https://developer.chrome.com/docs/extensions/reference/declarativeWebRequest)
still isn't supported outside of the Chrome Beta Channel.

So, this Extension has to use `Manifest V2` and all legacy that comes with it,
and the `Background Page` cannot use a `Service Worker`.




