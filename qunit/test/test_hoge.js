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

function dom(){
  return $("#questions_controller");
}

function anser_text_form(){
  return dom().find("div#anser_form input#anser_text");
}

function anser_texts_form(){
  var anser_texts = dom().find("div#anser_form input.anser_texts");
  var result = [];
  for(var i=0,l=anser_texts.length; i<l; i++){
    result.push($(anser_texts[i]));
  }
  return result;
}

function anser_button(){
  return dom().find("div#anser_form input#anser_button");
}

function next_button(){
  return dom().find("div#anser input#next_button");
}

// 回答入力フォームの確認の確認
// * q_text           : 問題文
// * multi_anser_size : 複数回答フォーム数
function check_anser_form(q_text, multi_anser_size){
  var q = dom().find("div#q:visible");
  equal(dom().find("div#anser:visible").length, 0, 'div#anser は見えないこと');

  equal(q.length,  1,       'div#q があって見えていること');
  equal(q.html(),  q_text,  '問題が表示されること');

  equal(dom().find("div#anser_form").length, 1, 'div#anser_form があること');

  if(multi_anser_size){
    equal(anser_texts_form().length, multi_anser_size, 'input.anser_texts が問題の数だけあること');
  }else{
    equal(anser_text_form().length, 1, 'input#anser_text があること');
  }

  equal(anser_button().length,      1, 'input#anser_button があること');
}

// 回答結果の確認
// * is_right   : 正解可否
// * anser_text : 正解文
// * text       : 解説文
function check_anser(is_right, anser_text, text){
  equal(dom().find("div#anser_form:visible").length, 0, 'div#anser_form はみえないこと');
  var a = dom().find("div#anser:visible");
  equal(a.length, 1, 'div#anser があって、見えていること');
  equal(a.find("div#anser_result").text(),     is_right ? '正解' : '不正解',  '回答結果が出ること');
  equal(a.find("div#anser_text").html(), anser_text,                    '回答が表示されること');
  equal(a.find("div#text").text(),       text ? text : '',              '解説文は無いこと');

  equal(next_button().length, 1, 'input#next_button があること');
}

test("QuestionsController", function(){
  var qsc = new QuestionsController([
    { q: '問題1', a: '答え1' },
    { q: '問題2', a: '答え2', text: '解説文' },
    { q: '問題3', a: ['答え3-1', '答え3-2'] },
    { q: '問題4', a: ['答え4-1', '答え4-2'], text: '解説文2' },
  ], $("#questions_controller"));
  qsc.start();

  check_anser_form('問題1');
  anser_text_form().val('答え1');
  anser_button().click();
  stop();
  setTimeout(push_anser, 100);

  function push_anser(){
    start();
    check_anser(true, '答え1');
    next_button().click();
    stop();
    setTimeout(push_next, 100);
  }

  function push_next(){
    start();
    check_anser_form('問題2');
    anser_text_form().val('間違えた答え');
    anser_button().click();
    stop();
    setTimeout(push_anser2, 100);
  }

  function push_anser2(){
    start();
    check_anser(false, '答え2', '解説文');
    next_button().click();
    stop();
    setTimeout(push_next2, 100);
  }

  function push_next2(){
    start();
    check_anser_form('問題3', 2);
    anser_texts_form()[0].val('答え3-2');
    anser_texts_form()[1].val('答え3-1');
    anser_button().click();
    stop();
    setTimeout(push_anser3, 100);
  }

  function push_anser3(){
    start();
    check_anser(true, '答え3-1<br>答え3-2');
    next_button().click();
    stop();
    setTimeout(push_next_3, 100);
  }

  function push_next_3(){
    start();
    check_anser_form('問題4', 2);
    anser_texts_form()[0].val('間違えた答え');
    anser_texts_form()[1].val('答え4-1');
    anser_button().click();
    stop();
    setTimeout(push_anser_4, 100);
  }

  function push_anser_4(){
    start();
    check_anser(false, '答え4-1<br>答え4-2', '解説文2');
    next_button().click();
    stop();
    setTimeout(push_next_4, 100);
  }

  function push_next_4(){
    start();
    equal(dom().find("div#anser_form:visible").length, 0, 'div#anser_form はみえないこと');
    equal(dom().find("div#anser:visible").length,      0, 'div#anser は見えないこと');
    equal(dom().find("div#result:visible").length,     1, 'div#result は見えること');
    var result = dom().find("div#result");
    equal(result.find("div#result_text").text(),      '結果',  '回答結果(テキスト)が出ること');
    equal(result.find("div#point").text(),            '2/4',   '回答結果(正解数)');
    equal(result.find("div#rate").text(),             '50%',   '回答結果(正解率)が出ること');
  }
});

