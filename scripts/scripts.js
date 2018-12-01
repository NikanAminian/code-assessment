
$(document).ready(function() {
    $.ajax({
        method: "GET",
        url: 'https://my.api.mockaroo.com/locations.json?key=a45f1200',
        dataType: 'json'
    }).success(function (response) {
        // work with response data here
        console.log(response);

        var html = '';
        $('.container-title').append('Found ' + response.length + ' Taco Trucks');

        $.each(response,function(key,val){

          // Call time_manager() to get closing times and check today's
          var today_close = time_manager.closingTime(val.monday_close ,val.tuesday_close ,val.wednesday_close ,
          val.thursday_close ,val.friday_close ,val.saturday_close, val.sunday_close);
          var open = time_manager.isOpen();

          // Assign address and coordinates, get user location
          var full_Address = val.address + '</br>' + val.city + ', ' + val.state + ' ' + val.postal_code;
          var coordinates = val.latitude + ',' + val.longitude;


          // Filling the html
          var newCard = '<div class="card" onclick="initMap(' + coordinates + ')">';
          var closeDiv = '</div>';

          html += newCard;
          html += '<p class="card-info" style="font-weight: bold">' + val.name + '<div class="distance"></div></p>';
          html += '<p class="card-info">' + full_Address + '</p>';
          if(open){
            html += '<p class="card-info" style="color:#00cc00;">Open today untill ' +  today_close +'</p>';
          } else {
            html += '<p class="card-info" style="color:red;">Closed for today</p>';
          }
          html += '<p class="card-info" style="color:orange;"><img class="phone-icon" src="./assets/phone-icon.png">(123)456-7890</p>';
          html += '<div class="btn-wrapper">';
          html += '<a href="https://www.google.com/maps/dir/?api=1&destination='+
                  coordinates+'&travelmode=driving" class="button" target="_blank">DIRECTIONS</a>';

          html += '<button class="button" data-toggle="modal" data-target="#infoModal" name="'+val.name+'" address="'+full_Address+
                  '" coordinates="'+coordinates+'" url="'+val.url+'" monday_open="'+val.monday_open+'" monday_close="'+val.monday_close+
                  '"tuesday_open="'+val.tuesday_open+'" tuesday_close="'+val.tuesday_close+'" wednesday_open="'+val.wednesday_open+'" wednesday_close="'+
                  val.wednesday_close+'" thursday_open="'+val.thursday_open+'" thursday_close="'+val.thursday_close+'" friday_open="'+
                  val.friday_open+'" friday_close="'+val.friday_close+'" saturday_open="'+val.saturday_open+'" saturday_close="'+
                  val.saturday_close+'" sunday_open="'+val.sunday_open+'" sunday_close="'+val.sunday_close+'">MORE INFO</button>';
          html += closeDiv+closeDiv;
          $('.left').html(html);
        });
    });

    // Fill the modal content according to the info button that was pressed
    $('#infoModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var name = button.attr('name'); // Extract info from data-* attributes
      var address = button.attr('address');
      //var phone =
      var coordinates = button.attr('coordinates');
      var direction = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination='+coordinates;
      var url = button.attr('url');

      var monday = button.attr('monday_open') + ' - ' + button.attr('monday_close');
      var tuesday = button.attr('tuesday_open') + ' - ' + button.attr('tuesday_close');
      var wednesday = button.attr('wednesday_open') + ' - ' + button.attr('wednesday_close');
      var thursday = button.attr('thursday_open') + ' - ' + button.attr('thursday_close');
      var friday = button.attr('friday_open') + ' - ' + button.attr('friday_close');
      var saturday = button.attr('saturday_open') + ' - ' + button.attr('saturday_close');
      var sunday = button.attr('sunday_open') + ' - ' + button.attr('sunday_close');

      var modal = $(this);
      modal.find('.name').html(name);
      modal.find('.address').html(address);
      //modal.find('.phone').html(phone);
      modal.find('.directions').attr('href',direction);
      modal.find('.btn').attr('href',url);
      modal.find('.monday').html(monday);
      modal.find('.tuesday').html(tuesday);
      modal.find('.wednesday').html(wednesday);
      modal.find('.thursday').html(thursday);
      modal.find('.friday').html(friday);
      modal.find('.saturday').html(saturday);
      modal.find('.sunday').html(sunday);

      // @media screen, if map div already not displaying
      if($('.right').css('display') == 'none') {
        $('.right').css('display','block');
      }
    })
});

var time_manager = (function() {

  var closing_times = {};
  var week = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  var date = new Date(); //Get the current date
  var day = week[date.getDay()]; //Extract weekday from current date

  // constructor for closing times
  function closingTime(monday_close,tuesday_close,wednesday_close,
    thursday_close ,friday_close,saturday_close,sunday_close) {
      this.monday_close = monday_close;
      this.tuesday_close = tuesday_close;
      this.wednesday_close = wednesday_close;
      this.thursday_close = thursday_close;
      this.friday_close = friday_close;
      this.saturday_close = saturday_close;
      this.sunday_close = sunday_close;

      closing_times["sunday"] = this.sunday_close;
      closing_times["monday"] = this.monday_close;
      closing_times["tuesday"] = this.tuesday_close;
      closing_times["wednesday"] = this.wednesday_close;
      closing_times["thursday"] = this.thursday_close;
      closing_times["friday"] = this.friday_close;
      closing_times["saturday"] = this.saturday_close;

      return closing_times[day];
    }
  // Check today's closing time and compare to current time
  function isOpen() {
    var closing_hour = parseInt(closing_times[day].substring(0,1));
    var closing_minutes = parseInt(closing_times[day].substring(2,4));

    // Convert pm to military time
    var time_convert = {};
    for (var i = 1,j=13; i < 12; ++i,++j) {
      time_convert[i] = j;
    }

    var current_hour = date.getHours();
    var current_minutes = date.getMinutes();

    // Compare times to see if the location is open today
    if (current_hour == time_convert[closing_hour]){
      if (current_minutes < closing_minutes){
        return true;
      } else {
        return false;
      }
    } else if (current_hour < time_convert[closing_hour]) {
      return true;
    } else {
      return false;
    }
  }

  // visible in namespace
  return {
      closingTime : closingTime,
      isOpen : isOpen
  };
  })();

// set params for google maps api
function initMap(lat,long) {
  var myLatlng = {lat: lat, lng: long};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom:13,
    center: myLatlng,
    scale: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map
  });
};

function show_map(){
  $('.right').css('display','block');
};

function show_list(){
  $('.right').css('display','none');
};

function calc_distance(coordinates){
  if (!navigator.geolocation) {
    // console.log('nav not good');
  } else {
    // console.log('nav is good');
    navigator.geolocation.getCurrentPosition(function(position) {
      var latLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude); // user location

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [latLng],
      destinations: [coordinates],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, function (response,status){ // call back to service response
      var dist = response.rows[0].elements[0].distance;
      var miles = dist.text;
      // $('.distance').html(miles); // .html() calls empty() first
      // console.log('dist: ' + miles);
    });
  });
}
};
