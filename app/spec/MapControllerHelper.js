/*Sources: https://docs.angularjs.org/api/ngMock/service/$httpBackend
https://github.com/markcoleman/angular-unittest/blob/b37249a70bd0b67363746e50eb161c42f628728d/test/SimpleServiceSpecs.js
*/
describe("mapController", function() 
{
    var scope, ctrl, $httpBackend;
    beforeEach(module('FlightCrewApp.controllers'));

    var coords,$httpBackend;

    beforeEach(inject(function(_$httpBackend_){
        $httpBackend = _$httpBackend_;
    }));

    describe("initAirportMarkers", function(){
    it("should make an http call to data/airportpositions.json", function(){
        $httpBackend.whenGET("data/airportpositions.json").respond(coords);
        //expect(coords).toBeDefined();
        console.log("jasmine coords:" + coords);
    })
    });

});
