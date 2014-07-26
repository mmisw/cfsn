var cfsnConfig = {

    sparqlEndpoint: 'http://mmisw.org/sparql',

    snOntology:     'http://mmisw.org/ont/cf/parameter',

    snClass:        'http://mmisw.org/ont/cf/parameter/Standard_Name',

    snPrefix:       'http://mmisw.org/ont/cf/parameter/',

    predicates: {
        definition:      'http://www.w3.org/2004/02/skos/core#definition',
        canonicalUnits:  'http://mmisw.org/ont/cf/parameter/canonical_units'
    },


    nerc: {
        sparqlEndpoint: 'http://vocab.nerc.ac.uk/sparql/sparql',
        uriQueryTemplate:
            'select distinct ?uri {?uri <http://www.w3.org/2004/02/skos/core#prefLabel> "{{stdname}}"@en .}'
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
