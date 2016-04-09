var app = angular.module('App', []);

app.controller('MainCtrl', function ($scope, data) {

    var palette = new Rickshaw.Color.Palette();

    var element = document.getElementById('chart');
    console.log(element);

    var gasmax = _.max(energy_data, function(item) { return item.s});
    var watermax = _.max(energy_data, function(item) { return item.q});

    var saisonmax = Math.max(gasmax.s, watermax.q);
    var tagmax = _.max(energy_data, function(item) { return item.r}).r;

    var overflow_without_batt_max = energy_data[energy_data.length - 1].x;


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
                y: 0,
                color: '#F5E10C'
            }, {
                name: 'Speicherseen',
                y: 0,
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
                y: 0,
                color: '#228012'
            }]
        }]
    });

    // Create the chart
    var balk_ueberschuss = new Highcharts.Chart({
        chart: {
            type: 'column',
            renderTo : document.getElementById('balkendiagramm_ueberschuss')
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
            },
            max: overflow_without_batt_max

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
                y: 0,
                color: '#ED1915'
            }]
        }]
    });




    // Create the chart
    $('#chart-container').highcharts('StockChart', {

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
                text: 'Energielevel (MW)'
            }
        },

        xAxis: {
            titel: {
                text: 'Zeit'
            }
        },

        title: {
            text: 'Überblick'
        },

        series: [{
            name: 'Erneuerbare Produktion ohne PV',
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
                name: 'Erneuerbare Produktion mit PV',
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
                },
                color: '#FF9500'
            },
            {
                name: 'Landesverbrauch',
                data: energy_data.map(function(item) {
                    return item.a
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
                },
                color: '#f00'
            }],
        legend: {
            enabled: true,
            floating: true,
            verticalAlign: 'top',
            align:'center',
            y:10
        }
    });
    console.log(data);


    function graphClick(event) {
        $scope.currentObject = energy_data[event.point.index];
        $scope.updateGraphs()
    }

    $scope.updateGraphs = function() {
        if ($scope.currentObject) {
            balk_saison.series[0].setData(
                [{
                    name: 'Power to gas',
                    y: $scope.currentObject.s,
                    color: '#576063'
                },
                    {
                        name: 'Speicherseen',
                        y: $scope.currentObject.q,
                        color: '#576063'
                    }]
                , true); //true / false to redraw
            var tag_level = $scope.battery ? $scope.currentObject.r : 0;
            balk_tag.series[0].setData(
                [{
                    name: 'Batterien',
                    y: tag_level,
                    color: '#576063'
                }]
                , true); //true / false to redraw

            var overflow = $scope.battery ? $scope.currentObject.v : $scope.currentObject.x;
            balk_ueberschuss.series[0].setData(
                [
                    {
                        y: overflow,
                    }]
                , true); //true / false to redraw
        }
    };

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


