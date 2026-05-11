/* eslint-disable no-undef */
'use strict';

$(document).ready(function () {

  // hide course drop down menu (on the dashboard) on click outside
  $(document).on('click', function (e) {
    if ($('.actions-dropdown.is-visible').length) {
      var $notCurrentDropdown = $('.action-more').not($(e.target)[0]).next();

      if ($notCurrentDropdown.hasClass('is-visible')) {
        $notCurrentDropdown.removeClass('is-visible');
        $notCurrentDropdown.attr('tabindex', -1);
      }

      if ($(e.target).closest('.wrapper-action-more').length) {
        return;
      }

      var $dropdown = $('.actions-dropdown');
      $dropdown.removeClass('is-visible');
      $dropdown.attr('tabindex', -1);
    }
  });

  // move to current course tab in course nav menu
  if( $('.sequence-nav li button.active').length && window.innerWidth <= 991 ) {
    var $navList = $('.sequence-nav ol').get(0),
          activeButtonOffsetLeft = $('.sequence-nav li button.active').get(0).parentNode.offsetLeft;

    if ( activeButtonOffsetLeft > $navList.offsetWidth ) {
      $('.xmodule_display.xmodule_SequenceModule .sequence-nav .sequence-list-wrapper').scrollLeft(activeButtonOffsetLeft);
    }

    $(document).on('click', '.xmodule_display.xmodule_SequenceModule .sequence-nav-button', function() {
      if( $navList.scrollWidth > $navList.offsetWidth ) {
        var activeButtonOffsetLeft = $('.sequence-nav li button.active').get(0).parentNode.offsetLeft;
        $('.xmodule_display.xmodule_SequenceModule .sequence-nav .sequence-list-wrapper').scrollLeft(activeButtonOffsetLeft);
      }
    });
  }

  // update iframe height in the textblock tab
  updateIframeHeight();
  $(window).on('resize', updateIframeHeight);

});

// fix adaptive for textblock iframe
function updateIframeHeight() {
    var iframeWidth = $('#viewer-frame').width();
    $('#viewer-frame').height(iframeWidth * 1.3);
}
