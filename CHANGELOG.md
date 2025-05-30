## [1.6.1](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.6.0...v1.6.1) (2025-05-30)


### Bug Fixes

* **ci:** remove CloudFront invalidation from deployment workflow ([bd6206d](https://github.com/EeroVakiparta/pikatchuprice/commit/bd6206da4e5ffb99e23f851aff483671873eb0d9))

# [1.6.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.5.0...v1.6.0) (2025-05-30)


### Bug Fixes

* **deps:** update package-lock.json to sync with package.json dependencies ([7784743](https://github.com/EeroVakiparta/pikatchuprice/commit/77847435c69ee78316768824b0e29266c3de5cd9))
* **ui:** remove y-axis minimum constraint for proper dynamic scaling ([2e0c343](https://github.com/EeroVakiparta/pikatchuprice/commit/2e0c343862bb7bbe85c93d47820fea8a06be932f))


### Features

* **weather:** enhance hourly forecast with detailed columns and remove current weather card ([e43491a](https://github.com/EeroVakiparta/pikatchuprice/commit/e43491a884b640ea98aaa133ffb8cdf3c1921ca4))

# [1.5.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.4.1...v1.5.0) (2025-05-30)


### Bug Fixes

* replace axios with native https in fuel prices lambda and add tests ([918576f](https://github.com/EeroVakiparta/pikatchuprice/commit/918576f4cfcfd90de339236bccf9939911190c11))
* **test:** replace corrupted fuel prices test with proper mocked implementation ([41e9647](https://github.com/EeroVakiparta/pikatchuprice/commit/41e9647def34f2c2501f8102d8342b8b4ec17c44))


### Features

* limit fuel stations to top 5 and move below electricity prices ([c3f6460](https://github.com/EeroVakiparta/pikatchuprice/commit/c3f64601847f92ea8f21736d3b8de3564531944a))
* **ui:** improve chart readability with better y-axis labeling and minimum scale ([8d84d01](https://github.com/EeroVakiparta/pikatchuprice/commit/8d84d0114cd8c69c75c2809386067f8580b2747d))

## [1.4.1](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.4.0...v1.4.1) (2025-04-21)


### Bug Fixes

* add favicon link to index.html ([f4ede37](https://github.com/EeroVakiparta/pikatchuprice/commit/f4ede37f7afc02b2065b39c0eb8d88b37a02ae2e))
* replace axios with native https in fetchFuelPrices lambda ([23a9467](https://github.com/EeroVakiparta/pikatchuprice/commit/23a9467151dcbe4e2415a53df27de9b145afd863))

# [1.4.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.3.0...v1.4.0) (2025-04-21)


### Features

* add fuel prices integration skeleton ([d0bdbd3](https://github.com/EeroVakiparta/pikatchuprice/commit/d0bdbd37dbe1a1962ee80f28cc1caadb58107ff8))
* add GitHub icon and fix manifest path ([66afea8](https://github.com/EeroVakiparta/pikatchuprice/commit/66afea8424ef5de104910c7b93b46326eac4d422))
* Enable live fuel prices data via API Gateway ([9deae6a](https://github.com/EeroVakiparta/pikatchuprice/commit/9deae6a200cc8391d837d922dee845cf064b5192))
* enhance fuel prices component with mock data, sorting, and improved UI ([fd26b84](https://github.com/EeroVakiparta/pikatchuprice/commit/fd26b841d6f9792a0bac8084c81f6fa487fb3e16))

# [1.3.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.2.0...v1.3.0) (2025-04-21)


### Features

* add version update notification for PWA ([c0ffdf5](https://github.com/EeroVakiparta/pikatchuprice/commit/c0ffdf56668e80ee9ffe930743df3ebf0493b40b))

# [1.2.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.1.1...v1.2.0) (2025-04-21)


### Features

* add user location detection and personalized weather ([73d92f6](https://github.com/EeroVakiparta/pikatchuprice/commit/73d92f6e24131a3e219312214c4c58a72ed46106))

## [1.1.1](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.1.0...v1.1.1) (2025-04-19)


### Bug Fixes

* Update GitHub Actions workflow to upload version.json to S3 after release ([1ab65fd](https://github.com/EeroVakiparta/pikatchuprice/commit/1ab65fd5e927151fea0b8ff407325a96d2d92385))

# [1.1.0](https://github.com/EeroVakiparta/pikatchuprice/compare/v1.0.0...v1.1.0) (2025-04-19)


### Features

* Add weather component for Tampere and fix README live site link ([74ca0a8](https://github.com/EeroVakiparta/pikatchuprice/commit/74ca0a89152a7e392745535d66016f11b8eade0d))

# 1.0.0 (2025-04-19)


### Bug Fixes

* add AWS credentials verification and error handling ([6a19a90](https://github.com/EeroVakiparta/pikatchuprice/commit/6a19a90512f16ccf332b967bd06d5c1c3b241f4f))
* Fix version.json generation in GitHub workflow ([d08857a](https://github.com/EeroVakiparta/pikatchuprice/commit/d08857afab51af8af8a5183d669e16b07e37aa22))
* improve semantic-release configuration for proper versioning ([5739858](https://github.com/EeroVakiparta/pikatchuprice/commit/5739858f17ff7bd3ea7f4f67c50e8aecd3f426c5))
* remove continue-on-error flags and implement proper failure handling ([346ead4](https://github.com/EeroVakiparta/pikatchuprice/commit/346ead45e252ed1d2aee313e6631ea78796653c7))
* replace deprecated conventional-changelog action with direct command ([79459cb](https://github.com/EeroVakiparta/pikatchuprice/commit/79459cb5dea38583a265acde716e3a620d670d57))
* update GitHub Actions workflow with correct permissions for semantic-release ([167b60e](https://github.com/EeroVakiparta/pikatchuprice/commit/167b60e625327daa6802fcf50355d8d718a9c0e6))
* update Pikachu image URL in README ([3b7b115](https://github.com/EeroVakiparta/pikatchuprice/commit/3b7b115b93a476870e0b062680acf29b3152ea23))
* update Puppeteer configuration for console error testing ([7eb3323](https://github.com/EeroVakiparta/pikatchuprice/commit/7eb3323ca9c5691852c4d3393ef38c4b9a29c0cd))
* update version tracking and CI/CD pipeline ([f8ffa26](https://github.com/EeroVakiparta/pikatchuprice/commit/f8ffa260027a2e9c320b2fed870dbd2e3557cff2))


### Features

* add console error monitoring and documentation ([ff00ac2](https://github.com/EeroVakiparta/pikatchuprice/commit/ff00ac2c805bed01f49a9c59bd5ba47b92b17cd5))
* implement semantic versioning system ([bc68f62](https://github.com/EeroVakiparta/pikatchuprice/commit/bc68f628f4a81d0be2f21704d375a0904096ea8a))

# 0.1.0 (2025-04-19)


### Bug Fixes

* add AWS credentials verification and error handling ([6a19a90](https://github.com/EeroVakiparta/pikatchuprice/commit/6a19a90512f16ccf332b967bd06d5c1c3b241f4f))
* Fix version.json generation in GitHub workflow ([d08857a](https://github.com/EeroVakiparta/pikatchuprice/commit/d08857afab51af8af8a5183d669e16b07e37aa22))
* improve semantic-release configuration for proper versioning ([5739858](https://github.com/EeroVakiparta/pikatchuprice/commit/5739858f17ff7bd3ea7f4f67c50e8aecd3f426c5))
* remove continue-on-error flags and implement proper failure handling ([346ead4](https://github.com/EeroVakiparta/pikatchuprice/commit/346ead45e252ed1d2aee313e6631ea78796653c7))
* replace deprecated conventional-changelog action with direct command ([79459cb](https://github.com/EeroVakiparta/pikatchuprice/commit/79459cb5dea38583a265acde716e3a620d670d57))
* update GitHub Actions workflow with correct permissions for semantic-release ([167b60e](https://github.com/EeroVakiparta/pikatchuprice/commit/167b60e625327daa6802fcf50355d8d718a9c0e6))
* update Pikachu image URL in README ([3b7b115](https://github.com/EeroVakiparta/pikatchuprice/commit/3b7b115b93a476870e0b062680acf29b3152ea23))
* update Puppeteer configuration for console error testing ([7eb3323](https://github.com/EeroVakiparta/pikatchuprice/commit/7eb3323ca9c5691852c4d3393ef38c4b9a29c0cd))
* update version tracking and CI/CD pipeline ([f8ffa26](https://github.com/EeroVakiparta/pikatchuprice/commit/f8ffa260027a2e9c320b2fed870dbd2e3557cff2))


### Features

* add console error monitoring and documentation ([ff00ac2](https://github.com/EeroVakiparta/pikatchuprice/commit/ff00ac2c805bed01f49a9c59bd5ba47b92b17cd5))
* implement semantic versioning system ([bc68f62](https://github.com/EeroVakiparta/pikatchuprice/commit/bc68f628f4a81d0be2f21704d375a0904096ea8a))
