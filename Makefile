hugo:
	# curl -fLo hugo.tar.gz https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_darwin-universal.tar.gz
	curl -fLo hugo.tar.gz https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_linux-amd64.tar.gz
	# curl -fLo hugo.zip https://github.com/zeromake/hugo/releases/download/v0.128.2/hugo_extended_0.128.2_windows-amd64.zip
	tar -xf hugo.tar.gz
	rm hugo.tar.gz
build: hugo ## Build the non-production site, which adds noindex headers to prevent indexing
	./hugo --enableGitInfo --gc --minify
