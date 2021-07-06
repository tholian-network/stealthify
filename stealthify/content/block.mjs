
new MutationObserver((mutations) => {

	mutations.forEach((mutation) => {

		if (mutation.type === 'childList') {

			Array.from(mutation.addedNodes).forEach((node) => {

				if (node.tagName === 'IFRAME') {
					node.parentNode.removeChild(node);
				} else if (node.tagName === 'SCRIPT') {
					node.parentNode.removeChild(node);
				} else if (node.textContent.startsWith('<!')) {
					node.parentNode.removeChild(node);
				}

			});

		}

	});

}).observe(document.documentElement, {
	childList: true,
	subtree:   true
});

