hugo:
	wget -O hugo https://download.fastgit.org/zeromake/hugo/releases/download/v0.84.0/hugo_linux_amd64 && chmod +x hugo
build: hugo ## Build the non-production site, which adds noindex headers to prevent indexing
	./hugo --enableGitInfo --gc --minify
