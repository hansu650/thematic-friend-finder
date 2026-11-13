# Sources, Dependencies and Assistance

The project was created by the user in IntelliJ IDEA using Spring Initializr-style Maven scaffolding. The current business logic, templates and interaction scripts were produced with Codex assistance for this course prototype. The team should understand and review this code and follow its course's attribution rules.

No Alovoa source files have been copied. [Alovoa](https://github.com/Alovoa/alovoa) was inspected as a reference option and was not adopted as the codebase. The older local Django prototype and the user's existing full-stack coursework informed flow and visual direction; this Java project is a separate implementation.

Runtime dependencies are declared in `pom.xml`. They include Spring Boot/Spring Framework/Spring Security, Thymeleaf and its security integration, Hibernate ORM, Jakarta validation and H2. Their code remains external dependency code, subject to the licences distributed with each dependency. This note does not relicense those libraries or declare a new licence for the whole project.

Primary implementation references: [Spring web content guide](https://spring.io/guides/gs/serving-web-content/), [Spring Boot SQL data documentation](https://docs.spring.io/spring-boot/reference/data/sql.html), [Spring MVC locale documentation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/localeresolver.html) and [Thymeleaf documentation](https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html).

No external profile photos, web fonts or third-party animation library are embedded. The card interaction uses local JavaScript and CSS. Development screenshots were captured with the user's installed Playwright screenshot helper; that helper is not part of the application runtime.

The 13 November interface refresh uses the user-supplied Momo/Tantan screenshots as layout references. `static/images/avatar-0.svg` through `avatar-4.svg` and `ui-icons.svg` are original Codex-assisted vector assets. No people, portraits or brand assets were extracted from the reference screenshots. The illustrated avatars are decorative placeholders; photo upload is not implemented.

For any later copied snippet or asset, record its exact source, licence, affected files, modifications and attribution before merging. Separate inspiration from copied code and actual individual work.
