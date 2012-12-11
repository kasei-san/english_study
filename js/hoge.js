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
  this.dom = dom;
  this.qs  = new Questions(datas);
}
QuestionsController.prototype = {
  start : function(){
    this.qs.reset();

    this.dom.append('<div id="q"></div>');
    this.qdom = this.dom.find("div#q");

    this.dom.append(
      $('<div id="a"></div>')
        .append('<input type="textarea" id="anser_text"><br>')
        .append('<input type="button"   id="anser_button" value="anser" >')
    );
    this.aform_dom = this.dom.find("div#a");
    this.aform_dom.find("input#anser_button").click(
      (function(controller){
        return (function(){ controller.anser() });
      })(this)
    );
    this.next();
  },
  is_answer: function(){
    var a = this.dom.find("div#a input#anser_text").val();
    return this.q.is_answer(a);
  },
  anser: function(){
    this.dom.find("div#a").remove();
    this.dom.append(
      $('<div id="a"></div>')
        .append($('<div id="result"><div>').text((this.is_answer) ? "正解" : "不正解"))
        .append($('<div id="anser_text"><div>').text(this.q.a))
        .append($('<div id="anser_text"><div>').text(this.q.text))
        .append('<input type="button"   id="next_button" value="next" >')
    );
  },
  next : function(){
    this.q = this.qs.next();
    this.qdom.html(this.q.q);
  },
}
