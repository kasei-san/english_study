test("is_equal",function(){
  ok("test".is_equal("test"),                   '同一内容ならtrueを返す');
  equal(false, "test".is_equal("abc"),          '異なる内容ならfalseを返す');
  ok(" t.est.".is_equal(".test. "),             '空白、ピリオドは無視');
  ok(["test", "abc"].is_equal(["abc", "test"]), '配列の場合、順番は無視');
  equal(false, ["test", "abc"].is_equal(["abc", "zzzz"]),
                                                '異なる内容ならfalseを返す');
  equal(false, ["test", "abc", "def"].is_equal(["abc", "test"]),
                                                '数が異なる場合、falseを返す');
});

// Stub
Array.prototype.shuffle = function(){ return this }

test("Questions", function(){
  var qs = new Questions([
    { q: '問題1', a: '答え1' },
    { q: '問題2', a: '答え2', text: '解説文' },
    { q: '問題3', a: '答え3' }
  ]);
  equal(qs.size(),      3, '問題数の取得');
  equal(qs.cnt(),       0, '問題カウンタ');
  equal(qs.anser_cnt(), 0, '正解カウンタ');

  var q = qs.next();
  equal('問題1', q.q,       '問題の取得');
  equal('答え1', q.a,       '回答の取得');
  equal(null   , q.text,    '解説文の取得');
  ok(q.is_answer('答え1'),  '回答のチェック(正解)');
  equal(qs.cnt(),       1, '問題カウンタ');
  equal(qs.anser_cnt(), 1, '正解カウンタ');

  equal(false, q.is_answer('zzzzz'),  '回答のチェック(不正解)');
  equal(qs.anser_cnt(), 0, '正解カウンタ');

  ok(q.is_answer('答え1'),  '回答のチェック(正解)');
  equal(qs.anser_cnt(), 1, '正解カウンタ');

  var q = qs.next();
  equal('問題2',  q.q,       '問題の取得');
  equal('答え2',  q.a,       '回答の取得');
  equal('解説文', q.text,    '解説文の取得');
  equal(false, q.is_answer('zzzzz'),  '回答のチェック(不正解)');
  equal(qs.cnt(),       2, '問題カウンタ');
  equal(qs.anser_cnt(), 1, '正解カウンタ');

  var q = qs.next();
  ok(q.is_answer('答え3'),  '回答のチェック(正解)');
  equal(qs.cnt(),       3, '問題カウンタ');
  equal(qs.anser_cnt(), 2, '正解カウンタ');

  q = qs.next();
  equal(null, q, '問題が無くなったら、nullを返す');
  equal(qs.cnt(), 3, '問題カウンタ');

  q = qs.next();
  equal(null, q, '問題が無くなったら、nullを返す(2回目)');

  // リセット
  qs.reset();
  equal(qs.size(),      3, '問題数の取得');
  equal(qs.cnt(),       0, '問題カウンタ');
  equal(qs.anser_cnt(), 0, '正解カウンタ');

  // 1問目を返す
  var q = qs.next();
  equal('問題1', q.q,       '問題の取得');
});

test("QuestionsController", function(){
  var dom = $("#questions_controller");
  var qsc = new QuestionsController([
    { q: '問題1', a: '答え1' },
    { q: '問題2', a: '答え2', text: '解説文' },
    { q: '問題3', a: ['答え3-1', '答え3-2'] },
    { q: '問題4', a: ['答え4-1', '答え4-2'] },
  ], dom);

  qsc.start();
  var q = dom.find("div#q");
  equal(q.length,  1,       'div#q があること');
  equal(q.html(), '問題1',  '問題が表示されること');

  var a = dom.find("div#anser_form");
  equal(a.length, 1, 'div#anser_form があること');

  var anser_text = a.find("input#anser_text");
  var anser_button = a.find("input#anser_button");

  equal(anser_text.length,   1, 'input#anser_text があること');
  equal(anser_button.length, 1, 'input#anser_button があること');

  anser_text.val("答え1");
  anser_button.click();
  stop();
  setTimeout(push_anser, 100);

  function push_anser(){
    start();
    var dom = $("#questions_controller");

    equal(dom.find("div#anser_form:visible").length, 0, 'div#anser_form はみえないこと');

    var a = dom.find("div#anser");
    equal(a.length, 1, 'div#anser があること');
    equal(a.find("div#result").text(),     '正解',  '正解となること');
    equal(a.find("div#anser_text").text(), '答え1', '回答が表示されること');
    equal(a.find("div#text").text(),       '',      '解説文は無いこと');

    equal(a.find("input#next_button").length, 1, 'input#next_button があること');
    next_button.click();
    stop();
    setTimeout(push_next, 100);
  }

  function push_next(){
    start();

    equal(dom.find("div#anser:visible").length, 0, 'div#anser は見えないこと');

    var q = dom.find("div#q");
    equal(q.length,  1,       'div#q があること');
    equal(q.html(), '問題2',  '問題が表示されること');

    var a = dom.find("div#anser_form");
    equal(a.length, 1, 'div#anser_form があること');

    var anser_text = a.find("input#anser_text");
    var anser_button = a.find("input#anser_button");
    equal(anser_text.length,   1, 'input#anser_text があること');
    equal(anser_button.length, 1, 'input#anser_button があること');

    anser_text.val("間違えた答え");
    anser_button.click();
    stop();
    setTimeout(push_anser2, 100);
  }

  function push_anser2(){
    start();
    var dom = $("#questions_controller");

    equal(dom.find("div#anser_form:visible").length, 0, 'div#anser_form はみえないこと');

    var a = dom.find("div#anser");
    equal(a.length, 1, 'div#anser があること');
    equal(a.find("div#result").text(),     '不正解', '不正解となること');
    equal(a.find("div#anser_text").text(), '答え2',  '回答が表示されること');
    equal(a.find("div#text").text(),       '解説文', '解説文は無いこと');

    equal(a.find("input#next_button").length, 1, 'input#next_button があること');
    next_button.click();
    stop();
    setTimeout(push_next2, 100);
  }

  function push_next2(){
    start();

    equal(dom.find("div#anser:visible").length, 0, 'div#anser は見えないこと');

    var q = dom.find("div#q");
    equal(q.length,  1,       'div#q があること');
    equal(q.html(), '問題3',  '問題が表示されること');

    var a = dom.find("div#anser_form");
    equal(a.length, 1, 'div#anser_form があること');

    var anser_button = a.find("input#anser_button");
    equal(a.find("input.anser_texts").length,   2, 'input.anser_texts が2個あること');
    equal(anser_button.length, 1, 'input#anser_button があること');

    $(a.find("input.anser_texts")[0]).val('答え3-2');
    $(a.find("input.anser_texts")[1]).val('答え3-1');

    // anser_button.click();
    // stop();
    // setTimeout(push_anser3, 100);
  }
});

