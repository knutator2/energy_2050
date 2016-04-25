var app = angular.module('App', []);

app.controller('MainCtrl', function ($scope, $interval, data) {

    var element = document.getElementById('chart');
    console.log(element);

    var gasmax = _.max(energy_data, function(item) { return item.s});
    var watermax = _.max(energy_data, function(item) { return item.q});

    var saisonmax = Math.max(gasmax.s, watermax.q);
    var tagmax = _.max(energy_data, function(item) { return item.r}).r;

    var overflow_without_batt_max = energy_data[energy_data.length - 1].x;

    var hasPlotline = false;
    var pointstart = 1199142000000;
    var pointInterval = 10800000;
    var currentSimValue = pointstart;
    var currentSimIndex = 0;
    var stepwidth = 10;


    var balk_saison = new Highcharts.Chart({
        chart: {
            renderTo: document.getElementById('balkendiagramm_saison'),
            type: 'column'
        },
        title: {
            text: 'Saisonale Speicher'
        },
        xAxis: {
            type: 'category',
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
            useHTML: true,
            text: 'Überschuss (Summe)</span>'
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
    var stockchart = Highcharts.StockChart({
        chart: {
            renderTo : document.getElementById('chart-container')
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
                text: 'Energielevel (MW)'
            }
        },

        xAxis: {
            title: {
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
            pointStart: pointstart,
            pointInterval: pointInterval,
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
                pointStart: pointstart,
                pointInterval: pointInterval,
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
                pointStart: pointstart,
                pointInterval: pointInterval,
                allowPointSelect: true,
                tooltip: {
                    valueDecimals: 1,
                    valueSuffix: 'MW'
                },
                point: {
                    events: {
                        click: function(event) {
                            graphClick(event);
                        },
                        mouseOver: function(event) {
                            graphHover(event);
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


    function graphHover(event) {
        $scope.currentObject = energy_data[event.target.index];
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
                        y: overflow
                    }]
                , true); //true / false to redraw
        }
    };

    $scope.startSimulation = function() {
        if (hasPlotline) {
            stockchart.xAxis[0].removePlotLine('simplotline');
        }

        stockchart.xAxis[0].addPlotLine({
            value: pointstart,
            color: 'red',
            width: 2,
            id: 'simplotline'
        });

        $interval(function() {
            currentSimValue += pointInterval * stepwidth;
            currentSimIndex += stepwidth;
            stockchart.xAxis[0].removePlotLine('simplotline');
            stockchart.xAxis[0].addPlotLine({
                value: currentSimValue,
                color: 'red',
                width: 2,
                id: 'simplotline'
            });
            $scope.currentObject = energy_data[currentSimIndex];
            $scope.updateGraphs();

        }, 20, energy_data.length);
    }
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


