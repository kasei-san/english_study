/*
TODO
 - json から問題を取得
 - 前回の結果を記録する
 - 実際に使用するHTMLを書く
*/

// strip : 前後の空白文字と、ピリオドを排除
String.prototype.strip = function(){ return this.replace(/\s|\./g, ""); }
Array.prototype.strip = function(){
  return this.inject([], function(result, data){ result.push(data.strip()); return result; }).sort();
}

// is_equal : 現在の値と、引数をstripした結果が一致しているか確認
String.prototype.is_equal = function(str){ return this.strip() == str.strip(); }
Array.prototype.is_equal = function(array){
  var a = this.strip();
  var b = array.strip();
  if(a.length != b.length){ return false; }
  for(var i=0,l=a.length; i<l; i++){ if(a[i] != b[i]){ return false; } }
  return true;
}

// 1段階のディープコビー
Array.prototype.dup = function(){
  return this.inject([], function(result, data){ result.push(data); return result; });
}

// 大体でいい
Array.prototype.shuffle = function(){ return this.sort(function (a, b) { return Math.ceil(Math.random() * 3) - 2; }); }

// Array拡張
Array.prototype.each = function(func){ for(var i=0,l=this.length; i<l; i++){ func.call(this, this[i]); } }
Array.prototype.inject = function(result, func){
  for(var i=0,l=this.length; i<l; i++){ result = func.call(this, result, this[i]); }
  return result;
}

// 問題管理メソッド
function Questions(datas){
  this.datas = [];
  datas.each(
    (function(questions){
      return function(data){
        data.is_answer = function(a){
          var result = this.a.is_equal(a);
          this.anser_status = result;
          return result;
        }
        questions.datas.push(data);
      }
    })(this)
  );
  this.reset();
}
Questions.prototype = {
  next      : function(){ return this.queue.shift() },
  reset     : function(){
                this.queue = this.datas.dup().shuffle();
                this.ansers = [];
                this.datas.each(function(data){ data.anser_status = false });
              },
  size      : function(){ return this.datas.length },
  cnt       : function(){ return this.size() - this.queue.length },
  anser_cnt : function(){
                return this.datas.inject(0, function(result, data){
                  if(data.anser_status === true){ result++; }
                  return result;
                });
              }
}
// view と Questions をつないでるので、controllerとした
function QuestionsController(datas, dom){
  this.qs  = new Questions(datas);
  this.dom = new DomController(dom, this);
}

QuestionsController.prototype = {
  // アクセサ
  cnt       : function(){ return this.qs.cnt() },
  anser_cnt : function(){ return this.qs.anser_cnt() },
  size      : function(){ return this.qs.size() },
  // アクション
  start : function(){
    this.qs.reset();
    this.next();
  },
  next : function(){
    this.q = this.qs.next();
    this.dom.anser.hide();
    if(this.q){
      this.dom.question.show();
      this.dom.anser_form.show();
    }else{
      this.dom.question.hide();
      this.dom.anser_form.hide();
      this.dom.result.show();
    }
  },
  anser: function(){
    this.dom.anser.show();
    this.dom.anser_form.hide();
  },
  is_answer: function(){ return this.q.is_answer(this.dom.anser_form.texts()); }
}

function DomController(dom, questionsController){
  this.dom = dom;
  this.controller = questionsController;
  this.question = new Dom($('<div id="q"></div>'), this.dom);
  this.question.set = (function(controller){
    return function(){
      this.dom.html(controller.q.q);
    }
  })(this.controller);
  this.anser = new Dom(
    $('<div id="anser"></div>')
      .append($('<div id="anser_result"><div>'))
      .append($('<div id="anser_text"><div>'))
      .append($('<div id="text"><div>'))
      .append($('<input type="button" id="next_button" value="next" >').click(
        (function(controller){
          return (function(){ controller.next() });
        })(this.controller)
      )),
    this.dom);
  this.anser.set = (function(controller){
    return function(){
      this.dom.find("div#anser_result").text((controller.is_answer()) ? "正解" : "不正解")
      var a = controller.q.a
      this.dom.find("div#anser_text").html((typeof a == "string") ? a : a.join("<br>"));
      if (controller.q.text == null || controller.q.text == ''){
        this.dom.find("div#text").text('');
      }else{
        this.dom.find("div#text").text(controller.q.text);
      }
    }
  })(this.controller);
  this.anser_form = new Dom(
    $('<div id="anser_form"></div>')
      .append($('<input type="button" id="anser_button" value="anser">').click(
           (function(controller){
             return (function(){ controller.anser() });
           })(this.controller)
         )
      ),
    this.dom);
  this.anser_form.set = (function(controller){
    return function(){
      this.dom.find("input#anser_text").remove();
      this.dom.find("input.anser_texts").remove();
      var a = controller.q.a
      if(typeof a == "string"){
        this.dom.prepend('<div><input type="text", id="anser_text"></div>');
      }else{
        for(var i=0,l=a.length; i<l; i++){
          this.dom.prepend('<div><input type="text", class="anser_texts"></div>');
        }
      }
    }
  }(this.controller));
  this.anser_form.texts = function(){
    if(this.dom.find("input#anser_text").length >= 1){
      return this.dom.find("input#anser_text").val();
    }else{
      var result = [];
      this.dom.find("input.anser_texts").each(function(){
        result.push($(this).val());
      });
      return result;
    }
  }
  this.result = new Dom(
    $('<div id="result"></div>')
      .append($('<div id="result_text">結果<div>'))
      .append($('<div id="point"><div>'))
      .append($('<div id="rate"><div>'))
    , this.dom
  );
  this.result.set = (function(controller){
    return function(){
      var size = controller.size() - 0;
      var anser_cnt  = controller.anser_cnt() - 0;
      this.dom.find("div#point").text(anser_cnt + "/" + size);
      this.dom.find("div#rate").text(Math.round((anser_cnt/size)*100) + "%");
    }
  })(this.controller);
}

// DOM制御用class
Dom = function(dom, base_dom){
  this.dom = dom;
  this.base_dom = base_dom;
}

// DOMの生成、検索、削除を行うClass
Dom.prototype = {
  find : function(){ return this.base_dom.find(this.dom) },
  show : function(){
    if(this.find().length == 0){ this.create() }
    this.set();
    this.find().show();
    return this.find();
  },
  hide : function(){
    if(this.find().length > 0){ this.find().hide() }
    return this.find();
  },
  create : function(){
    if(this.find().length == 0){ this.base_dom.append(this.dom) }
    return this.find();
  },
  // 何か値をセットするメソッド。必要に応じてオーバーロードする
  set : function(){ }
}

