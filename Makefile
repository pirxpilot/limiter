check: lint test

lint:
	@./node_modules/.bin/jshint index.js test/*.js

test:
	@./node_modules/.bin/mocha \
		--reporter spec

.PHONY: test lint
