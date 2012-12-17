String.prototype.strip = function(){ return this.replace(/\s|\./g, ""); }
String.prototype.is_equal = function(str){ return this.strip() == str.strip(); }

Array.prototype.strip = function(){
  var a = [];
  for(var i=0,l=this.length; i<l; i++){ a.push(this[i].strip()); }
  return a.sort();
}

Array.prototype.is_equal = function(array){
  var a = this.strip();
  var b = array.strip();
  if(a.length != b.length){ return false; }
  for(var i=0,l=a.length; i<l; i++){ if(a[i] != b[i]){ return false; } }
  return true;
}

// 1段階のディープコビー
Array.prototype.dup = function(){
  var result = [];
  for(var i=0,l=this.length; i<l; i++){ result.push(this[i]) }
  return result;
}

// 大体でいい
Array.prototype.shuffle = function(){ return this.sort(function (a, b) { return Math.ceil(Math.random() * 3) - 2; }); }

Array.prototype.each = function(func){
  for(var i=0,l=this.length; i<l; i++){
    func.call(this, this[i]);
  }
}
Array.prototype.inject = function(result, func){
  for(var i=0,l=this.length; i<l; i++){
    result = func.call(this, result, this[i]);
  }
  return result;
}

function Questions(datas){
  this.datas = [];
  for(var i=0, l=datas.length; i<l; i++){
    var data = datas[i];
    // 特異メソッド的な
    data.is_answer = function(a){
      var result = this.a.is_equal(a);
      this.anser_status = result;
      return result;
    }
    this.datas.push(datas[i]);
  }
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

function DomController(dom, questionsController){
  this.dom = dom;
  this.controller = questionsController;
  this.question = new Dom($('<div id="q"></div>'), this.dom);
  this.anser = new Dom(
    $('<div id="anser"></div>')
      .append($('<div id="result"><div>'))
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
      this.dom.find("div#result").text((controller.is_answer()) ? "正解" : "不正解")
      var a = controller.q.a
      this.dom.find("div#anser_text").html((typeof a == "string") ? a : a.join("<br>"));
      this.dom.find("div#text").text(controller.q.text);
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

QuestionsController.prototype = {
  start : function(){
    this.qs.reset();
    this.next();
  },
  next : function(){
    this.q = this.qs.next();
    this.dom.anser.hide();
    this.dom.question.show().html(this.q.q);
    this.dom.anser_form.show();
  },
  anser: function(){
    this.dom.anser.show();
    this.dom.anser_form.hide();
  },
  is_answer: function(){
    return this.q.is_answer(this.dom.anser_form.texts());
  }
}
