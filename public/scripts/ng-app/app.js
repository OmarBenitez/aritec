
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

    const init = function(){

        $scope.todaysMoney = Math.random()*1000;

    }

    socket.on('newRandom', (obj) => {

        $scope.todaysMoney = obj.rand;

    })


    init();

}])