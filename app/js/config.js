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
    }

};
