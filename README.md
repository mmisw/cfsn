cfsn
====

A CF Standard Names Vocabulary browser -- prototype

Deployment available at http://mmisw.org/cfsn

See the [wiki](https://github.com/mmisw/cfsn/wiki) for documentation.


### Trying cfsn locally:

Clone the repo `git clone https://github.com/mmisw/cfsn.git` and then open
`app/index.html` in your browser. To avoid potential issues caused by some
browsers when opening a local web application, you can make the `app/`
subdirectory accessible from your web server. If you have
[nodejs](http://nodejs.org/) installed, you can simply run:
```
$ node scripts/web-server.js
```
and then open [http://localhost:8000/app/index.html](http://localhost:8000/app/index.html)


### Noteworthy changes

- 0.1.3: preliminary mappings included.

- 0.1.2: general info retrieved from endpoint.

- 0.1.1: filtering by category as [here](http://cfconventions.org/Data/cf-standard-names/27/build/cf-standard-name-table.html)
but allowing multiple selection and applied as a first filter.

- 0.1.0: global search modes: glob and regex.

- 0.0.5: preliminary inclusion of term links against NVS.

- 0.0.3: options: change page size; showAll button.

- 0.0.2: cache; better hyperlinking in descriptions.
