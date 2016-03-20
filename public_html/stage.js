/******************************************************************************
 * OpenLP - Open Source Lyrics Projection                                      *
 * --------------------------------------------------------------------------- *
 * Copyright (c) 2008-2016 OpenLP Developers                                   *
 * --------------------------------------------------------------------------- *
 * This program is free software; you can redistribute it and/or modify it     *
 * under the terms of the GNU General Public License as published by the Free  *
 * Software Foundation; version 2 of the License.                              *
 *                                                                             *
 * This program is distributed in the hope that it will be useful, but WITHOUT *
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       *
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    *
 * more details.                                                               *
 *                                                                             *
 * You should have received a copy of the GNU General Public License along     *
 * with this program; if not, write to the Free Software Foundation, Inc., 59  *
 * Temple Place, Suite 330, Boston, MA 02111-1307 USA                          *
 ******************************************************************************/
window.OpenLP = {
  loadService: function (event) {
    $.getJSON(
      "/api/service/list",
      function (data, status) {
        OpenLP.updateSlide();
      }
    );
    console.log("service current slide:" + OpenLP.currentSlide);
  },
  loadSlides: function (event) {
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        OpenLP.currentSlides = data.results.slides;
        OpenLP.currentSlide = 0;
        OpenLP.currentTags = Array();
         $.each(data.results.slides, function(idx, slide) {
             if (slide["selected"])
            OpenLP.currentSlide = idx;
        })
        console.log("load slide current slide:" + OpenLP.currentSlide);
        OpenLP.loadService();
    });
  },
  updateSlide: function() {
    // Show the current slide on top. Any trailing slides for the same verse
    // are shown too underneath in grey.
    // Then leave a blank line between following verses
    $("#currentslide").empty();
    var selClass ="";
    var thisRow=$("<div/>").addClass("row");
    $.each(OpenLP.currentSlides, function(id,slide){
        console.log(slide);
        if (slide['selected'])
        {
           selClass="selectedSlide";           
        }
        else
        {
            selClass= "notSelectedSlide";
        }
        thisRow.append(
            $('<div/>')
                .addClass("col-lg-4 verseBox")
                .addClass(selClass)
                .append("<span/>")
                .html("<h3 style=\"display:inline; padding-right:15px;\">"+slide['tag']+"</h3>"+slide['text'])
        );
        if(id % 3 ==2  )
        {
            $("#currentslide").append(thisRow);
            thisRow=$("<div/>").addClass("row");
        }
        
    });
    $("#currentslide").append(thisRow);
    console.log("update slide current slide:" + OpenLP.currentSlide);

  },
  updateClock: function(data) {
    var div = $("#clock");
    var t = new Date();
    var h = t.getHours();
    if (data.results.twelve && h > 12)
      h = h - 12;
    var m = t.getMinutes();
    if (m < 10)
      m = '0' + m + '';
    div.html(h + ":" + m);
  },
  pollServer: function () {
    $.getJSON(
      "/api/poll",
      function (data, status) {
        OpenLP.updateClock(data);
        if (OpenLP.currentItem != data.results.item ||
            OpenLP.currentService != data.results.service) {
          OpenLP.currentItem = data.results.item;
          OpenLP.currentService = data.results.service;
          OpenLP.loadSlides();
        }
        else if (OpenLP.currentSlide != data.results.slide) {
          console.log("updating current slide from "+OpenLP.currentSlide+" to " + data.results.slide);
          OpenLP.currentSlides[OpenLP.currentSlide]['selected']=0
          OpenLP.currentSlide = parseInt(data.results.slide, 10);
          OpenLP.currentSlides[OpenLP.currentSlide]['selected']="true";
          OpenLP.updateSlide();
        }
      }
    );
  }
}
$.ajaxSetup({ cache: false });
setInterval("OpenLP.pollServer();", 500);
OpenLP.pollServer();
