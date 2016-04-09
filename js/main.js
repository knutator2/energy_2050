var app = angular.module('App', []);

app.controller('MainCtrl', function ($scope, data) {

    var palette = new Rickshaw.Color.Palette();

    var element = document.getElementById('chart');
    console.log(element);

    var gasmax = _.max(energy_data, function(item) { return item.s});
    var watermax = _.max(energy_data, function(item) { return item.q});

    var saisonmax = Math.max(gasmax.s, watermax.q);
    var tagmax = _.max(energy_data, function(item) { return item.r}).r;



    var balk_saison = new Highcharts.Chart({
        chart: {
            renderTo: document.getElementById('balkendiagramm_saison'),
            type: 'column'
        },
        title: {
            text: 'Saisonale Speicher'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            },
            max: saisonmax

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Power to gas',
                y: 56.33,
                color: '#F5E10C'
            }, {
                name: 'Speicherseen',
                y: 24.03,
                color: '#1784E3'
            }]
        }]
    });
    // Create the chart
    var balk_tag = new Highcharts.Chart({
        chart: {
            renderTo: document.getElementById('balkendiagramm_tag'),
            type: 'column'
        },
        title: {
            text: 'Tagesspeicher'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            },
            max: tagmax

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Batterien',
                y: 12,
                color: '#228012'
            }]
        }]
    });

    // Create the chart
    var balk_ueberschuss = $('#balkendiagramm_ueberschuss').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Überschuss'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: false,
            data: [{
                name: 'Überschuss',
                y: 12,
                color: '#ED1915'
            }]
        }]
    });

    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=large-dataset.json&callback=?', function (data) {

        // Create a timer
        var start = +new Date();

        // Create the chart
        $('#chart-container').highcharts('StockChart', {
            chart: {
                events: {
                    load: function () {
                        if (!window.isComparing) {
                            this.setTitle(null, {
                                text: 'Built chart in ' + (new Date() - start) + 'ms'
                            });
                        }
                    }
                },
                zoomType: 'x'
            },

            rangeSelector: {

                buttons: [{
                    type: 'day',
                    count: 3,
                    text: '3d'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1w'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                selected: 3
            },

            yAxis: {
                title: {
                    text: 'Summe der erneuerbaren Produktion (MW)'
                }
            },

            title: {
                text: 'Überblick'
            },

            subtitle: {
                text: 'Built chart in ...' // dummy text to reserve space for dynamic subtitle
            },

            series: [{
                name: 'Summe der erneuerbaren Produktion ohne PV',
                data: energy_data.map(function(item) {
                    return item.b - item.e
                }),
                pointStart: 1199142000000,
                pointInterval: 10800000,
                allowPointSelect: true,
                tooltip: {
                    valueDecimals: 1,
                    valueSuffix: 'MW'
                },
                point: {
                    events: {
                        click: function(event) {
                            graphClick(event);
                        }
                    }
                }
            },
                {
                    name: 'Gesamt mit PV',
                    data: energy_data.map(function(item) {
                        return item.b
                    }),
                    pointStart: 1199142000000,
                    pointInterval: 10800000,
                    allowPointSelect: true,
                    tooltip: {
                        valueDecimals: 1,
                        valueSuffix: 'MW'
                    },
                    point: {
                        events: {
                            click: function(event) {
                                graphClick(event);
                            }
                        }
                    }
                }]

        });
        console.log(data);
    });

    function graphClick(event) {
        $scope.currentObject = energy_data[event.point.index];
        balk_saison.series[0].setData(
                    [{
                        name: 'Power to gas',
                        y: $scope.currentObject.s,
                        color: '#F5E10C'
                    },
                    {
                        name: 'Speicherseen',
                        y: $scope.currentObject.q,
                        color: '#1784E3'
                    }]
                , true); //true / false to redraw
                balk_tag.series[0].setData(
                    [{
                        name: 'Batterien',
                        y: $scope.currentObject.r,
                        color: '#228012'
                    }]
                    , true); //true / false to redraw
    }

    // data.sumsWithoutPV(function(err, data){
    //     console.log(data);
    //     data = data.map(function(item, index) {
    //         return { x : index, y: item.Summe }
    //     });
    //     console.log (data);
    //     var graph = new Rickshaw.Graph({
    //         element: element,
    //         width: 540,
    //         height: 240,
    //         renderer: 'line',
    //         series: [
    //             {
    //                 name: "Erneuerbare Energien ohne Photovoltaik",
    //                 data: data,
    //                 color: palette.color()
    //             }
    //         ]
    //     } );
    //     var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );
    //
    //     var y_axis = new Rickshaw.Graph.Axis.Y( {
    //         graph: graph,
    //         orientation: 'left',
    //         tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    //         element: document.getElementById('y_axis'),
    //     } );
    //
    //     var hoverDetail = new Rickshaw.Graph.HoverDetail( {
    //         onShow: function(event){
    //             var index = Date.parse($(".x_label").text()) / 1000;
    //             console.log(index);
    //             console.log(energy_data[index]);
    //             $scope.currentObject = energy_data[index];
    //
    //         },
    //         graph: graph
    //     } );
    //
    //     $scope.rickshawClick = function() {
    //         console.log('clicked rickshaw');
    //         console.log($scope.currentObject);
    //         balk_saison.series[0].setData(
    //             [{
    //                 name: 'Power to gas',
    //                 y: $scope.currentObject.s,
    //                 color: '#F5E10C'
    //             },
    //             {
    //                 name: 'Speicherseen',
    //                 y: $scope.currentObject.q,
    //                 color: '#1784E3'
    //             }]
    //         , true); //true / false to redraw
    //         balk_tag.series[0].setData(
    //             [{
    //                 name: 'Batterien',
    //                 y: $scope.currentObject.r,
    //                 color: '#228012'
    //             }]
    //             , true); //true / false to redraw
    //
    //     };
    //
    //     var slider = new Rickshaw.Graph.RangeSlider({
    //         graph: graph,
    //         element: document.querySelector('#slider')
    //     });
    //
    //     var legend = new Rickshaw.Graph.Legend( {
    //         element: document.querySelector('#legend'),
    //         graph: graph
    //     });
    //
    //     var offsetForm = document.getElementById('offset_form');
    //
    //     offsetForm.addEventListener('change', function(e) {
    //         var offsetMode = e.target.value;
    //
    //         if (offsetMode == 'lines') {
    //             graph.setRenderer('line');
    //             graph.offset = 'zero';
    //         } else {
    //             graph.setRenderer('stack');
    //             graph.offset = offsetMode;
    //         }
    //         graph.render();
    //
    //     }, false);
    //
    //     graph.render();
    // });



});

app.factory('data', function($http) {
    return {
        sumsWithoutPV: function (cb) {
            $http.get('js/data_json/summe_erneuerbar.json')
                .then(function (result) {
                    cb(null, result.data);
                })
        }
    };
});


