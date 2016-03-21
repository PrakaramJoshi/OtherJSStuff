var prompt = require('prompt');
var logger = require('./logger.js');
var _ = require('lodash');
var fs = require('fs');
prompt.start();

function log(obj){
  console.log(obj);
}

function empty(data)
{
  return data==''
}
function get_val(usertyped){
  if(empty(usertyped))
      return "0";
  return usertyped;
}

var get_details = function(cb){

  prompt.get(['input'], function (err, result) {

    var input = get_val(result.input);
    cb(input);
    setTimeout(function(){
      get_details(cb)},0);
  });
}
var pad_length = function(data, length, padFront){
  var padding ="";
  for(var i=0;i<length;i++){
    padding=padding+"0";
  }
  if(padFront){
    return padding+data;
  }
  return data+padding;
}
var pad = function(data,modulo,padFront){
  //logger.ilog(data.length);
  var remainder = (data.length % modulo);
  if(remainder ==0){
    //logger.olog(data.length);
    return data;
  }
  remainder = modulo -remainder;
  return pad_length(data,remainder, padFront);
}

var prettyPrint =function(data,space_at_every){
  var prettyData = "";
  for(var i=0;i<data.length;i++){
    if(i>0 && i % space_at_every ==0){
      prettyData=prettyData+" ";
    }
    prettyData=prettyData+data[i];
  }
  logger.highlight("Print Begin");
  logger.statlog(prettyData);
  logger.highlight("Print End");
}

var dec2Bin=function(decimal,padding){
    if(!padding)
      padding =8;
    return pad(decimal.toString(2),padding,true);
}

var binToHex =function(bin){
  bin =pad(bin,4,true);
  var hex="";
  for(var i=0;i<bin.length;i+=4){
    hex = hex+parseInt(bin.substring(i,i+4),2).toString(16);
  }
  return hex;
}

var hexToBin = function(hex){
  var bin ="";
  for(var i=0;i<hex.length;++i){
    bin = bin + pad(parseInt(hex[i],16).toString(2),4,true);
  }
  return bin;
}

var get_chunks = function(a,length_of_element){
  if(a.length % length_of_element != 0){
    a = pad(a,length_of_element,true);
  }
  var result = [];
  var val="";
  for(var i=1;i<=a.length;++i){
    if( i % length_of_element == 0){
      val = val + a[i-1];
      result.push(val);
      val ="";
    }
    else {
      val = val + a[i-1];
    }
  }
  return result
}

var make_equal_length = function(a,b){
  var length_a = a.length;
  var length_b = b.length;
  var delta = length_a -length_b;
  if(delta>0){
    a = pad(a,delta,true);
  }
  else if(delta <0){
    b = pad_length(b,Math.abs(delta),true);
  }
  return [a,b];
}

var XOR =function (a,b){
  var a_b = make_equal_length(a,b);
  a = a_b[0];
  b = a_b[1];
  var length = a.length;
  var result = "";

  for(var i=0;i<length;i++){
    if(a[i]==b[i])
      result = result + "0";
    else
      result = result + "1";
  }
  return result;
}

var AND =function(a,b){

  var a_b = make_equal_length(a,b);
  a = a_b[0];
  b = a_b[1];
  var length = a.length;
  var result = "";

  for(var i=0;i<length;i++){
    if(a[i]==b[i] && a[i]=="1")
      result = result + "1";
    else
      result = result + "0";
  }

  return result;
}

var OR =function(a,b){
  var a_b = make_equal_length(a,b);
  a = a_b[0];
  b = a_b[1];
  var length = a.length;
  var result = "";
  for(var i=0;i<length;i++){
    if(a[i]=="1" || a[i]=="1")
      result = result + "1";
    else
      result = result + "0";
  }

  return result;
}

var NOT = function(a){
  var result="";
  for(var i=0;i<a.length;i++){
    if(a[i]=="1"){
      result = result +"0";
    }
    else{
      result = result + "1";
    }
  }
  return result;
}

var RIGHT_ROTATE = function(a){

  if(a.length<2)
    return a;
  var b = a[a.length-1];
  for(var i=1;i<a.length;i++){
    b = b + a[i-1];
  }
  return b;
}

var RIGHT_SHIFT = function(a){
  if(a.length==1)
    return "0";
  if(a.length==0)
    return a;
  var b = "0";
  for(var i=1;i<a.length;i++){
    b = b + a[i-1];
  }
  return b;
}

var RIGHT_ROTATE_N = function(a,n){
  for(var i=0;i<n;i++){
    a = RIGHT_ROTATE(a);
  }
  return a;
}

var RIGHT_SHIFT_N = function(a,n){
  for(var i=0;i<n;i++){
    a = RIGHT_SHIFT(a);
  }
  return a;
}

var ADDITION_MODULO_32 = function(a,b){
  var a_b = make_equal_length(a,b);
  // logger.statlog("a length "+ a.length);
  // logger.statlog("b length "+ b.length);
  // logger.statlog("a_b[0] length "+ a_b[0].length);
  // logger.statlog("a_b[1] length "+ a_b[1].length);
  a = a_b[0];
  b = a_b[1];
  var length = a.length;
  var result = "";
  var carry_forward=0;
  for(var i=length-1;i>=0;i--){
    if(a[i]==0 && b[i]==0 && carry_forward =="0"){
      result = "0"+result;
      carry_forward = "0";
    }
    else if(a[i]==0 && b[i]==0 && carry_forward =="1"){
      result = "1"+result;
      carry_forward = "0";
    }
    else if(a[i]==0 && b[i]==1 && carry_forward =="0"){
      result = "1"+result;
      carry_forward = "0";
    }
    else if(a[i]==0 && b[i]==1 && carry_forward =="1"){
      result = "0"+result;
      carry_forward = "1";
    }
    else if(a[i]==1 && b[i]==0 && carry_forward =="0"){
      result = "1"+result;
      carry_forward = "0";
    }
    else if(a[i]==1 && b[i]==0 && carry_forward =="1"){
      result = "0"+result;
      carry_forward = "1";
    }
    else if(a[i]==1 && b[i]==1 && carry_forward =="0"){
      result = "0"+result;
      carry_forward = "1";
    }
    else if(a[i]==1 && b[i]==1 && carry_forward =="1"){
      result = "1"+result;
      carry_forward = "1";
    }
  }
  return result;
}
var initialize_hash_values = function(){
  var hash_values =[];
  //first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
  hash_values.push(hexToBin("6a09e667"));
  hash_values.push(hexToBin("bb67ae85"));
  hash_values.push(hexToBin("3c6ef372"));
  hash_values.push(hexToBin("a54ff53a"));
  hash_values.push(hexToBin("510e527f"));
  hash_values.push(hexToBin("9b05688c"));
  hash_values.push(hexToBin("1f83d9ab"));
  hash_values.push(hexToBin("5be0cd19"));
  return hash_values;
}

var initialize_round_constants = function(){
  var k =[];
  //first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  k.push(hexToBin("428a2f98"));k.push(hexToBin("71374491"));k.push(hexToBin("b5c0fbcf"));k.push(hexToBin("e9b5dba5"));k.push(hexToBin("3956c25b"));k.push(hexToBin("59f111f1"));k.push(hexToBin("923f82a4"));k.push(hexToBin("ab1c5ed5"));
  k.push(hexToBin("d807aa98"));k.push(hexToBin("12835b01"));k.push(hexToBin("243185be"));k.push(hexToBin("550c7dc3"));k.push(hexToBin("72be5d74"));k.push(hexToBin("80deb1fe"));k.push(hexToBin("9bdc06a7"));k.push(hexToBin("c19bf174"));
  k.push(hexToBin("e49b69c1"));k.push(hexToBin("efbe4786"));k.push(hexToBin("0fc19dc6"));k.push(hexToBin("240ca1cc"));k.push(hexToBin("2de92c6f"));k.push(hexToBin("4a7484aa"));k.push(hexToBin("5cb0a9dc"));k.push(hexToBin("76f988da"));
  k.push(hexToBin("983e5152"));k.push(hexToBin("a831c66d"));k.push(hexToBin("b00327c8"));k.push(hexToBin("bf597fc7"));k.push(hexToBin("c6e00bf3"));k.push(hexToBin("d5a79147"));k.push(hexToBin("06ca6351"));k.push(hexToBin("14292967"));
  k.push(hexToBin("27b70a85"));k.push(hexToBin("2e1b2138"));k.push(hexToBin("4d2c6dfc"));k.push(hexToBin("53380d13"));k.push(hexToBin("650a7354"));k.push(hexToBin("766a0abb"));k.push(hexToBin("81c2c92e"));k.push(hexToBin("92722c85"));
  k.push(hexToBin("a2bfe8a1"));k.push(hexToBin("a81a664b"));k.push(hexToBin("c24b8b70"));k.push(hexToBin("c76c51a3"));k.push(hexToBin("d192e819"));k.push(hexToBin("d6990624"));k.push(hexToBin("f40e3585"));k.push(hexToBin("106aa070"));
  k.push(hexToBin("19a4c116"));k.push(hexToBin("1e376c08"));k.push(hexToBin("2748774c"));k.push(hexToBin("34b0bcb5"));k.push(hexToBin("391c0cb3"));k.push(hexToBin("4ed8aa4a"));k.push(hexToBin("5b9cca4f"));k.push(hexToBin("682e6ff3"));
  k.push(hexToBin("748f82ee"));k.push(hexToBin("78a5636f"));k.push(hexToBin("84c87814"));k.push(hexToBin("8cc70208"));k.push(hexToBin("90befffa"));k.push(hexToBin("a4506ceb"));k.push(hexToBin("bef9a3f7"));k.push(hexToBin("c67178f2"));
  return k;
}

var sha256_stage_0_get_binary =function(data){
  var bin = ""
  _.forEach(data,function(value,key){
    var ascii = value.charCodeAt(0);
    bin = bin + dec2Bin(ascii);
  });
  return bin;
}

var sha256_stage_1_preprocess = function(data){
  var length = data.length;
  data = data+"1";
  var padding = (data.length % 512) ;
  if(padding < 448 )
    padding = 448 - padding;
  else if(padding > 448 ){
    padding  = 448 + (512 - padding) ;
  }
  else
    padding =0;
  data = pad_length(data, padding, false);
  data= data+dec2Bin(length,64);
  return data;
}

var sha256_main_loop = function(chunks,orginial_data,paddedData){
  var stream = fs.createWriteStream(orginial_data+".txt");
  stream.once('open', function(fd) {
  });
  stream.write(orginial_data+"\r\n");
  stream.write(paddedData+"\r\n");
  var a,b,c,d,e,f,g,h;
  var hashes = initialize_hash_values();
  var k = initialize_round_constants();
  var w=[];
  var s0;
  var s1;
  var S1;
  var S0;
  var ch;
  var temp1;
  var maj;
  var temp2;
  var digest
  logger.statlog("Total chunks:\t\t"+chunks.length);
  //Process the message in successive 512-bit chunks:
  for(var n=0;n<chunks.length;n++){
    //Initialize working variables to current hash value:
    logger.statlog("Processing chunk:\t"+(n+1));
    a = hashes[0];
    b = hashes[1];
    c = hashes[2];
    d = hashes[3];
    e = hashes[4];
    f = hashes[5];
    g = hashes[6];
    h = hashes[7];

    w =[];
    //copy chunk into first 16 words w[0..15] of the message schedule array
    for(var i =0;i<16;i++){
      var  w_i =chunks[n].substr(i*32,32);
      w.push(w_i);
    }
    //Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array:
    for(var i=16;i<64;i++){
      //s0 := (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift 3)
      s0 = XOR( XOR( RIGHT_ROTATE_N(w[i-15],7), RIGHT_ROTATE_N(w[i-15],18) ), RIGHT_SHIFT_N(w[i-15],3));
      //s1 := (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
      s1 = XOR( XOR( RIGHT_ROTATE_N(w[i-2],17), RIGHT_ROTATE_N(w[i-2],19) ), RIGHT_SHIFT_N(w[i-2],10));
      //w[i] := w[i-16] + s0 + w[i-7] + s1
      w[i] = ADDITION_MODULO_32( ADDITION_MODULO_32( ADDITION_MODULO_32( w[i-16], s0), w[i-7]), s1);
    }

    //Compression function main loop:
    for(var i=0;i<64;i++){
      logger.statlog(binToHex(a)+" "+binToHex(b)+" "+binToHex(c)+" "+binToHex(d)+" "+binToHex(e)+" "+binToHex(f)+" "+binToHex(g)+" "+binToHex(h))
      stream.write(i+":\t"+a+" "+b+" "+c+" "+d+" "+e+" "+g+" "+h+"\r\n");
      //S1 := (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
      S1 = XOR(XOR( RIGHT_ROTATE_N(e,6), RIGHT_ROTATE_N(e,11)), RIGHT_ROTATE_N(e,25));
      //ch := (e and f) xor ((not e) and g)
      ch = XOR(AND(e,f), AND((NOT(e)),g));
      //temp1 := h + S1 + ch + k[i] + w[i]
      temp1 = ADDITION_MODULO_32( ADDITION_MODULO_32( ADDITION_MODULO_32( ADDITION_MODULO_32(h, S1),ch), k[i]), w[i]);
      //S0 := (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
      S0 = XOR(XOR( RIGHT_ROTATE_N(a,2), RIGHT_ROTATE_N(a,13)),RIGHT_ROTATE_N(a,22))
      //maj := (a and b) xor (a and c) xor (b and c)
      maj = XOR( XOR( AND(a,b),AND(a,c)), AND(b,c))
      //temp2 := S0 + maj
      temp2 = ADDITION_MODULO_32(S0,maj)

      h = g
      g = f
      f = e
      e = ADDITION_MODULO_32(d,temp1)
      d = c
      c = b
      b = a
      a = ADDITION_MODULO_32(temp1, temp2)
    }
    //Add the compressed chunk to the current hash value:
    hashes[0] = ADDITION_MODULO_32(hashes[0],a);
    hashes[1] = ADDITION_MODULO_32(hashes[1],b);
    hashes[2] = ADDITION_MODULO_32(hashes[2],c);
    hashes[3] = ADDITION_MODULO_32(hashes[3],d);
    hashes[4] = ADDITION_MODULO_32(hashes[4],e);
    hashes[5] = ADDITION_MODULO_32(hashes[5],f);
    hashes[6] = ADDITION_MODULO_32(hashes[6],g);
    hashes[7] = ADDITION_MODULO_32(hashes[7],h);
  }
  digest = hashes[0] + hashes[1] + hashes[2] + hashes[3] + hashes[4] + hashes[5] + hashes[6] + hashes[7];
  stream.end();
  return digest;
}


var sha256 = function(data){
  _.forEach(data,function(value,key){
    var ascii = value.charCodeAt(0);
    logger.statlog("["+key+"]\t"+value+"\t"+ascii+"\t"+dec2Bin(ascii));
  });
  var binData       = sha256_stage_0_get_binary(data);
  var paddedData    = sha256_stage_1_preprocess(binData);
  prettyPrint(binToHex(paddedData),8);
  var chunks        = get_chunks(paddedData,512);
  var digest        = sha256_main_loop(chunks,data,paddedData);
  //logger.highlight(digest);
  var hex           = binToHex(digest);
  logger.highlight(hex);
  //prettyPrint(binToHex(paddedData),8);

}
get_details(sha256);
