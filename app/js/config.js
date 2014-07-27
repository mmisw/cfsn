var cfsnConfig = {

    orr: {
        sparqlEndpoint: 'http://mmisw.org/sparql',
        snPrefix:       'http://mmisw.org/ont/cf/parameter/',

        termListQuery:
            "prefix cfsn: <http://mmisw.org/ont/cf/parameter/>\n" +
            "prefix skos: <http://www.w3.org/2004/02/skos/core#>\n" +
            "select distinct ?name ?definition ?canonicalUnits\n" +
            "where {\n" +
            //"  ?name a cfsn:Standard_Name.\n" +  <- subsumed by next condition
            "  cfsn:parameter skos:narrower ?name.\n" +
            "  OPTIONAL { ?name skos:definition      ?definition }\n" +
            "  OPTIONAL { ?name cfsn:canonical_units ?canonicalUnits }\n" +
            "} order by ?name",

        termQueryTemplate:
            "prefix cfsn: <http://mmisw.org/ont/cf/parameter/>\n" +
            "prefix skos: <http://www.w3.org/2004/02/skos/core#>\n" +
            "select distinct ?definition ?canonicalUnits where {\n" +
            "  cfsn:parameter skos:narrower {{name}}.\n" +
            "  OPTIONAL { {{name}} skos:definition      ?definition }\n" +
            "  OPTIONAL { {{name}} cfsn:canonical_units ?canonicalUnits }\n" +
            "}"
    },

    nerc: {
        sparqlEndpoint: 'http://vocab.nerc.ac.uk/sparql/sparql',
        uriQueryTemplate:
            "prefix skos: <http://www.w3.org/2004/02/skos/core#>\n" +
            'select distinct ?uri {?uri skos:prefLabel "{{stdname}}"@en .}'
    },

    // according to http://cfconventions.org/Data/cf-standard-names/27/build/cf-standard-name-table.html as of 2014-07-25
    categories: [{
        label:        'Atmospheric Chemistry',
        searchString: 'aerosol dry.*deposition wet.*deposition production emission mole'
    }, {
        label:        'Atmospheric Dynamics',
        searchString: 'air_pressure atmosphere.*vorticity atmosphere.*streamfunction wind momentum.*in_air gravity_wave ertel geopotential omega atmosphere.*dissipation atmosphere.*energy atmosphere.*drag atmosphere.*stress surface.*stress'
    }, {
        label:        'Carbon Cycle',
        searchString: 'carbon leaf vegetation'
    }, {
        label:        'Cloud',
        searchString: 'cloud'
    }, {
        label:        'Hydrology',
        searchString: 'atmosphere_water canopy_water precipitation rain snow moisture freshwater runoff root humidity transpiration evaporation water_vapour river'
    }, {
        label:        'Ocean Dynamics',
        searchString: 'ocean.*streamfunction sea_water_velocity ocean.*vorticity'
    }, {
        label:        'Radiation',
        searchString: 'radiative longwave shortwave brightness radiance albedo'
    }, {
        label:        'Sea Ice',
        searchString: 'sea_ice'
    }, {
        label:        'Surface',
        searchString: 'surface'
    }]

};
