cfsn
====

A CF Standard Names Vocabulary browser -- prototype

Deployment available at http://mmisw.org/cfsn

See the [wiki](https://github.com/mmisw/cfsn/wiki) for documentation.


### Trying cfsn locally:

1. Clone the repo `git clone https://github.com/mmisw/cfsn.git`
1. Make the `app/` directory accessible from your web server
1. Open the index file in your browser

Typically you will want or need a local web server for the step 2
above. If you have [nodejs](http://nodejs.org/) installed on your system,
you can do the following:
```shell
$ npm install http-server -g
$ http-server
Starting up http-server, serving ./ on port: 8080
Hit CTRL-C to stop the server
```
and then open [http://localhost:8080/app/](http://localhost:8080/app/)


### Noteworthy changes

- 0.1.5: fix \#23

- 0.1.4: general info in separate lines and other minor adjustments.

- 0.1.3: preliminary mappings included.

- 0.1.2: general info retrieved from endpoint.

- 0.1.1: filtering by category as [here](http://cfconventions.org/Data/cf-standard-names/27/build/cf-standard-name-table.html)
but allowing multiple selection and applied as a first filter.

- 0.1.0: global search modes: glob and regex.

- 0.0.5: preliminary inclusion of term links against NVS.

- 0.0.3: options: change page size; showAll button.

- 0.0.2: cache; better hyperlinking in descriptions.
