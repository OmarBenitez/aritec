
const app = angular.module('appSensores', []);

app.factory('socket', function ($rootScope) {
    var socket = io.connect('localhost:3001');
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

    $scope.init = function(){
        $scope.todaysMoney = Math.random()*1000;
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

    })

    $scope.getColor= function(value) {
        //value from 0 to 1

        var hue = ((1 - value) * 120).toString(10);
        return ["hsl(", hue, ",100%,50%)"].join("");
    }

}])