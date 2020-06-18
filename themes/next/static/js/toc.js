$(document).ready(function () {
  function toc(parent, prefex) {
    parent.children("ul").each(function () {
      $ul = $(this);
      $ul.children("li").each(function () {
        $li = $(this);
        listStr = prefex
        if ($li.children("a").length > 0) {
          if (listStr != "") { listStr += "."}
          listStr += ($li.index() + 1);
          $li.html(listStr + " " + $li.html());
          toc($li, listStr)
        } else {
          toc($li, listStr)
        }
      });
    });
  }

  var $t = $("#TableOfContents");
  toc($t, "");
});


