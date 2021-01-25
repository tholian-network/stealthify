
# HTTP Optimizer Problem

Don't redirect! Use a simple request to `http://localhost:65432/stealth/<url>` and let browser request it via https.
This will lead to an additional copy being made into the Stealth cache, which is fine enough as it prevents further requests in future.


- [ ] Redirect `https://` requests to `http://`, wait for the response.
- [ ] If responseHeaders contain a Location header to `https://` of the same URL, redirect it to the `/stealth/https://<url>`

# TODO

- [ ] Integrate redirects so that `/stealth/:tabid:/` is used.

