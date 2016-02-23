// let's do infix!

function pow(a,b){return Math.pow(a,b);}
function intPow(a,b){return Math.pow(a,b)|0;}
function mul(a,b){return a*b;}
function intMul(a,b){return (+a)*(+b)|0;}
function div(a,b){return a/b;}
function intDiv(a,b){return (+a)/(+b)|0;}
function add(a,b){return a+b;}
function intAdd(a,b){return (+a)+(+b)|0}
function sub(a,b){return a-b;}
function intSub(a,b){return (+a0)-(+b)|0;}
function and(a,b){return a&&b;}
function flip(x){return typeof x==="string"?x.split("").reverse().join(""):typeof x==="number"?+flip(x+""):x.reverse()}
function range(a,b){
	// from cyoce
	var out = Array(b-a+1);
	while (b >= a) out[b-a] = b--;
	return out;
}
function flatten(b){
	return [].concat.apply([],b);
}
function arr(a,b){
	return flatten([a,b]);
}
function sin(x){
	return Array.isArray(x)?Math.sin(x[0]):Math.sin(x);
}
function max(x){
	return Math.max.apply(null,x);
}
function disp(x){
	if(Array.isArray(x)) x.forEach(disp);
	else alert(x);
	return x;
}
function set(world,variable,value){
	return world[variable] = value;
}
RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function dec(a,b){
	return eval((a|0)+"."+(b|0));
}
function str(x){
	return Array.isArray(x)?x.join(""):x+"";
}
function map(x,f){
	
}
function inverse(a){
	return a.slice?a.slice(1):1/a;
}

var OPERATORS = {
	"<-": [-Infinity, 0, set],
	"=": [-Infinity, 0, set],
	"..": [6, 0, range],
	"&": [5, 0, and],
	"^": [4, 1, pow],
	"*": [3, 0, mul],
	"/": [3, 0, div],
	".+": [2.5, 0, intAdd],
	".-": [2.5, 0, intSub],
	".*": [2.5, 0, intMul],
	"./": [2.5, 0, intDiv],
	".^": [2.5, 0, intPow],
	"+": [2, 0, add],
	"-": [2, 0, sub],
	",": [1, 0, arr],
	".": [0.5, 1, dec]
};

var KEYWORDS = ["max", "sin", "disp", "str", "flatten", "<-", "->", "=", "+<>", "'<>", ",<>", "<>", "~", "inv"];
function tokenize(string){
	return string.match(RegExp(KEYWORDS.concat(Object.keys(OPERATORS)).map(RegExp.escape).join("|")+"|\\d+|[&+,-/*^()]|\\s+|\\w+|.+?","g"));
}

var FUNCTIONS = {"sin":sin,"max":max,"disp":disp,"flatten":flatten,"~":flip,"str":str,"->":map,"inv":inverse};

function shunt(string){
	var tokens = tokenize(string), oQueue = [], stack = [], token, o1, o2;
	while(tokens.length){
		token = tokens.shift();
		if(token === "\""){
			var s = token;
			do {
				s += token = tokens.shift();
			} while(token !== "\"" && token);
			oQueue.push(s.slice(1,-1));
		} else if(!isNaN(parseFloat(token))&&isFinite(token)){
			oQueue.push(token);
		} else if(FUNCTIONS[token]){
			stack.push(token);
		//} else if(token === ","){
		//	while(stack[stack.length-1] !== "(" && stack.length){
		//		oQueue.push(stack.pop());
		//	}
		} else if(OPERATORS[token]){
			o1 = token;
			o2 = stack[stack.length-1];
			while(stack.length && OPERATORS[o2] && ((OPERATORS[token][0] <= OPERATORS[o2][0] && !OPERATORS[token][1]) || (OPERATORS[token][0] < OPERATORS[o2][0] && OPERATORS[token][1]))){
				oQueue.push(stack.pop());
				o2 = stack[stack.length-1];
			}
			stack.push(token);
		} else if(token === "("){
			stack.push(token);
		} else if(token === ")"){
			while(stack.length && stack[stack.length-1] !== "("){
				oQueue.push(stack.pop());
			}
			stack.pop();
			if(FUNCTIONS[stack[stack.length-1]]){
				oQueue.push(stack.pop());
			}
		} else {
			oQueue.push(token);
		}
	}
	while(stack.length){
		oQueue.push(stack.pop());
	}
	return oQueue;
}

function parse(equ,vars){
	vars = vars || {};
	var lines = equ.split("`"), line, stack, token, res = [];
	for(var i=0;i<lines.length;i++){
		line = shunt(lines[i]);
		stack = [];
		while(line.length){
			token = line.shift();
			if(typeof vars[token] !== "undefined"){
				stack.push(vars[token]);
			} else if(!isNaN(parseFloat(token))&&isFinite(token)) stack.push(+token);
			else if(["<-","="].indexOf(token)>=0){
				var a = stack.pop(), b = stack.pop();
				vars[b] = a;
				stack.push(vars[b]);
			} else if(token === "input" || token === "<>"){
				stack.push(eval(prompt()));
			} else if(token === "'<>"){
				stack.push(prompt());
			} else if(OPERATORS[token]){
				var op = OPERATORS[token][2], args = stack.splice(stack.length-op.length,op.	length).map(function(e){return typeof e === "undefined" ? eval(prompt()) : e});
				stack.push(op.apply(null,args));
			} else if(FUNCTIONS[token]){
				stack.push(FUNCTIONS[token](stack.pop()));
			} else stack.push(token);
		}
		res.push(stack[0]);
	}
	return res.length === 1 ? res[0] : res;
}

function wrapper(code){
	code = code.split(";");
	var world = {pi: Math.PI, e: Math.E};
	for(var i=0;i<code.length;i++){
		var line = parse(code[i],world);
	}
}
