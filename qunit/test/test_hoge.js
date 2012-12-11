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
    { q: '問題3', a: '答え3' }
  ], dom);

  qsc.start();
  var q = dom.find("div#q");
  equal(q.length,  1,       'div#q があること');
  equal(q.html(), '問題1',  '問題が表示されること');

  var a = dom.find("div#a");
  equal(a.length, 1, 'div#a があること');

  var anser_text = a.find("input#anser_text");
  var anser_button = a.find("input#anser_button");

  equal(anser_text.length,   1, 'input#anser_text があること');
  equal(anser_button.length, 1, 'input#anser_button があること');

  anser_text.val("回答1");
  anser_button.click();
  stop();

  function push_anser(){
    start();
    var dom = $("#questions_controller");
    var a = dom.find("div#a");
    equal(a.length, 1, 'div#a があること');
    equal(a.find("div#result").text(),     '正解',  '正解となること');
    equal(a.find("div#anser_text").text(), '答え1', '回答が表示されること');
    equal(a.find("div#text").text(),       '',      '解説文は無いこと');

    var anser_text = a.find("input#anser_text");
    var anser_button = a.find("input#anser_button");
    equal(anser_text.length,   0, 'input#anser_text がないこと');
    equal(anser_button.length, 0, 'input#anser_button がないこと');

    var next_button = a.find("input#next_button");
    equal(anser_button.length, 0, 'input#next_button があること');
    next_button.click();
    stop();
  }

  setTimeout(push_anser, 100);
});







