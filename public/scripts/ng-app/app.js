
const app = angular.module('appSensores', []);

app.factory('socket', function ($rootScope) {
    var socket = io.connect('185.28.23.41:3001');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

app.controller('indexCtrl', ['$http', '$scope', 'socket', ($http, $scope, socket) => {

    $scope.g1Percent=0;
    $scope.g1Deg =0;
    $scope.g2Percent=0;
    $scope.g2Deg =0;
    $scope.g3Percent=0;
    $scope.g3Deg =0;
    $scope.g4Percent=0;
    $scope.g4Deg =0;
    $scope.g5Percent=0;
    $scope.g5Deg =0;

    $scope.init = function(){
        $scope.todaysMoney = Math.random()*1000;

        $http.get('/api/getCaudalKPIs').then(r => {
            console.log(r.data);
            var timeData = r.data.map(_ => ({q1:_.QT, d: new Date(_.timestamp)}))

            buildChart(timeData);
        })
    }

    socket.on('humedad', (obj) => {

        console.log(obj);
        if(obj.H1 && Number(obj.H1)) {
            $scope.g1Percent = obj.H1 > 100 ? 100 : obj.H1;
            $scope.g1Deg = 180*$scope.g1Percent/100;
        }

        if(obj.H2 && Number(obj.H2)) {
            $scope.g2Percent = obj.H2 > 100 ? 100 : obj.H2;
            $scope.g2Deg = 180*$scope.g2Percent/100;
        }

        if(obj.H3 && Number(obj.H3)) {
            $scope.g3Percent = obj.H3 > 100 ? 100 : obj.H3;
            $scope.g3Deg = 180*$scope.g3Percent/100;
        }

        if(obj.H4 && Number(obj.H4)) {
            $scope.g4Percent = obj.H4 > 100 ? 100 : obj.H4;
            $scope.g4Deg = 180*$scope.g4Percent/100;
        }

        if(obj.H5 && Number(obj.H5)) {
            $scope.g5Percent = obj.H5 > 100 ? 100 : obj.H5;
            $scope.g5Deg = 180*$scope.g5Percent/100;
        }

    })

    $scope.getColor= function(value) {
        //value from 0 to 1

        var hue = ((1 - value) * 120).toString(10);
        return ["hsl(", hue, ",100%,50%)"].join("");
    }

    const buildChart = (data) => {

        var ctx2 = document.getElementById("chart-line").getContext("2d");

        var gradientStroke1 = ctx2.createLinearGradient(0, 230, 0, 50);

        gradientStroke1.addColorStop(1, 'rgba(5,69,105,0.2)');
        gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
        gradientStroke1.addColorStop(0, 'rgba(5,69,105,0)'); //purple colors

        var gradientStroke2 = ctx2.createLinearGradient(0, 230, 0, 50);

        gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
        gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
        gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

        new Chart(ctx2, {
            type: "line",
            data: {
                labels: data.map(_ => _.d.toLocaleDateString()),
                datasets: [{
                    label: "Caudal por Semana",
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                    borderColor: "#054569",
                    borderWidth: 3,
                    backgroundColor: gradientStroke1,
                    fill: true,
                    data: data.map(_ => _.q1),
                    maxBarThickness: 6

                }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                scales: {
                    y: {
                        grid: {
                            drawBorder: false,
                            display: true,
                            drawOnChartArea: true,
                            drawTicks: false,
                            borderDash: [5, 5]
                        },
                        ticks: {
                            display: true,
                            padding: 10,
                            color: '#b2b9bf',
                            font: {
                                size: 11,
                                family: "Open Sans",
                                style: 'normal',
                                lineHeight: 2
                            },
                        }
                    },
                    x: {
                        grid: {
                            drawBorder: false,
                            display: false,
                            drawOnChartArea: false,
                            drawTicks: false,
                            borderDash: [5, 5]
                        },
                        ticks: {
                            display: true,
                            color: '#b2b9bf',
                            padding: 20,
                            font: {
                                size: 11,
                                family: "Open Sans",
                                style: 'normal',
                                lineHeight: 2
                            },
                        }
                    },
                },
            },
        });
    }

}])