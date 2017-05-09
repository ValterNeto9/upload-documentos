var ws;
var funcaoSucesso;

/**
 * Função que inicializa o cliente javascript tentando se conectar com o BRy Signer Web instalado localmente.
 * @param porta A porta que o BRy Signer Web está esperando para receber uma conexão.
 * @param funcaoErroCarregamento Função que será invocada para tratar os erros do websocket, caso ocorram.
 * @param funcaoSucessoCarregamento Função que será chamada após a conexão ser estabelecida com o BRy Signer Web localmente.
 */
function cliente(porta, funcaoErroCarregamento, funcaoSucessoCarregamento) {
	try{
		ws = new WebSocket('wss://localhost:' + porta + '/');
	}catch(e) {
		/*
		 * Para IE
		 */
		if(e == "SecurityError") {
			window.location = "../instalacao/passosInstalacao.html";
		}
	}

	ws.onopen = function() {
		if (typeof(funcaoSucessoCarregamento) == "function") {
			funcaoSucesso = funcaoSucessoCarregamento;
		}
		enviarDesafio();
		inicializarSigner();
	};

	ws.onmessage = function(evt) {
		tratarMensagem(evt);
	};

	ws.onclose = function(evt) {
		funcaoErroCarregamento(evt.code, evt.reason);
	};

	ws.onerror = function(err) {
		ws.close();
	};
};

function functionName(){
    alert("TESTE");
};

/**
 * Função invocada ao ocorrer um erro com o websocket.
 * @param codigoErro Código de status de erro.
 * @param razaoErro Descrição breve do erro ocorrido.
 */
function redirecionarPagina(codigoErro, razaoErro) {
	if (codigoErro == "1001") {

		var resposta = confirm("A conexão com o servidor ultrapassou seu tempo limite! Clique em\nOK para atualizar a página ou CANCELAR para não realizar a ação.\n\nCaso cancele, a página não será atualizada.");
	    if(resposta == true) {
	    	window.location.reload();
	    }

	} else if (codigoErro == "1006") {
		window.location = "../instalacao/passosInstalacao.html";
	} else if (codigoErro == "1009") {
		alert("Excedido o limite de dados na comunicação com o websocket");
	} else if (codigoErro == "1011") {
		if(razaoErro == "erro.sessao.insegura") {
			window.location = "../instalacao/passosInstalacao.html";
		} else {

			var resposta = confirm("Um erro interno ocorreu! Você deseja tentar novamente?\nOK para tentar novamente ou CANCELAR para não executar nenhuma ação.");
		    if(resposta == true) {
		    	window.location.reload();
		    }

		}
	}
}

/**
 * Captura os parâmetros da página para serem enviados ao BRy Signer Web executando localmente.
 */
function inicializarSigner() {
	// Seta parâmetros no BRy Signer Web
	var dado = getParametrosInit();
	dado["comando"] = 'parametros';

	enviarRequisicao(JSON.stringify(dado));
}

/**
 * Função que informa a validade do certificado no campo da página.
 * Se o certificado estiver espirado, a cor da validade ficará com a cor vermelha,
 * caso contrário, ficará com a cor verde.
 */
function setValidadeCert(certificado) {
	var texto = "Validade: " + certificado.fimValidade;
	if (!certificado.valido) {
		document.getElementById("validade_id").innerHTML = "<span style='color:red'>" + texto + "</span>";
	} else {
		document.getElementById("validade_id").innerHTML = "<span style='color:green'>" + texto + "</span>";
	}
}

/**
 * Função que escreve a codificação do certificado em um campo hidden na página.
 */
function setCertificado(index) {
	var certificado = certificados[index].certificado;
	alert(certificado);
	document.getElementById("certificado").value = certificado;
}

/**
 * Função que implementa token para aprimorar a segurança na comunicação websocket entre a página e o BRy Signer Web.
 */
function enviarDesafio() {
	try{
		var token = document.getElementById("form1:token").value;
		var tokenAssinado = document.getElementById("form1:tokenAssinado").value;
	} catch (exception) {
		var token = document.getElementById("token").value;
		var tokenAssinado = document.getElementById("tokenAssinado").value;
	}
	var requisicao = {};
	requisicao["comando"] = 'verificar';
	requisicao["token"] = token;
	requisicao["tokenAssinado"] = tokenAssinado;
	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Função que trata os comandos enviados pelo BRy Signer Web para a página.
 * @param evt Mensagem que foi enviada pelo Bry Signer Web.
 */
function tratarMensagem(evt) {
	var resposta = JSON.parse(evt.data);

	if (resposta["comando"] == "certificados") {
		tratarCertificados(resposta);
	} else if (resposta["comando"] == "parametrosEstaticos") {
		tratarVersao(resposta);
	} else if (resposta["comando"] == "certificado") {
		exibirCertificado(resposta);
	} else if (resposta["comando"] == "base64") {
		tratarCertificadoBase64(resposta);
	} else if (resposta["comando"] == "parametro") {
		tratarParametro(resposta);
	} else if (resposta["comando"] == "parametroID") {
		tratarParametroID(resposta);
	} else if (resposta["comando"] == "setParametroID") {
		setParametroID(resposta);
	} else if(resposta["comando"] == "finalizar") {
		finalizarAssinatura(resposta);
	} else if (resposta["comando"] == "filechooser") {
		listarArquivos(resposta);
	} else if (resposta["comando"] == "estatistica") {
		tratarEstatisticas(resposta);
	} else if(resposta["comando"] == "alerta") {
		exibirAlerta(resposta);
	} else if(resposta["comando"] == "exibirProgresso") {
		exibeProgresso(resposta);
	} else if(resposta["comando"] == "exibirBarraProgresso") {
		exibeBarraDeProgresso(resposta);
	} else if(resposta["comando"] == "imagem") {
		exibeCaminhoImagem(resposta);
	}
}

/**
 * Exibe o caminho da imagem no input.
 * @param resposta  Resposta a ser codificada contendo o caminho da imagem selecionada.
 */
function exibeCaminhoImagem(resposta) {
	document.getElementById("imagemSelecionada").value = resposta["caminho"];
}

/**
 * Função que define quando será visível ou não a barra de progresso na página.
 * @param visivel True se for visível ou false se não for visível.
 */
function exibirBarraProgresso(visivel) {
	/*if (visivel == true) {
		document.getElementById('progresso').style.display = 'block';
		document.getElementById('barraProgresso').style.display = 'block';
	} else {
		document.getElementById('progresso').style.display = 'none';
		document.getElementById('barraProgresso').style.display = 'none';
	}*/
}

/**
 * Função que carrega os certificados enviados pelo BRy Signer Web e adiciona em um combobox.
 * @param resposta
 */
function tratarCertificados(resposta) {
	if(resposta["certificadoDefault"] == "Não há certificado a ser mostrado"){
		var combo = document.getElementById("combo_certificados");
		combo.style.width = '350px';
		combo.options.length = 0;

		var opt = document.createElement("option");
		opt.appendChild(document.createTextNode(resposta["certificadoDefault"]));
		opt.value = "Não há certificado a ser mostrado";
		combo.appendChild(opt);
	} else {
		// Seta o combo de certificados e solicita o primeiro certificado
		var hash = JSON.parse(resposta["certificadoJSONDefault"]).hash;

		if(document.getElementById("form1:certificado") != null) {
			document.getElementById("form1:certificado").value = resposta["certificadoDefault"];
		}

		avisoExpirar(JSON.parse(resposta["certificadoJSONDefault"])["fimValidade"]);
		setValidadeCert(JSON.parse(resposta["certificadoJSONDefault"]));

		delete resposta.comando;
		delete resposta.certificadoDefault;
		delete resposta.certificadoJSONDefault;

		var combo = document.getElementById("combo_certificados");
		combo.style.width = '350px';
		combo.options.length = 0;

		for ( var key in resposta) {
			var opt = document.createElement("option");
			opt.appendChild(document.createTextNode(resposta[key]));
			opt.value = key;
			combo.appendChild(opt);
		}

		combo.value = hash;
	}
	//funcaoSucesso();
}

/**
 * Função que verifica se a versão do BRy Signer Web é a mais recente.
 * @param resposta Mensagem contendo a versão enviada pelo BRy Signer Web.
 */
function tratarVersao(resposta) {
	var versao = resposta["versao"].replace(".", "").replace(".", "");

	// 420 (4.2.0) é a versão mínima permitida para executar
	if(versao < 420) {
		window.location = "../instalacao/passosInstalacao.html";
	}

	atualizarListaCertificadosWS();
}

/**
 * Função que exibe as informações do certificado na tela.
 * @param resposta Mensagem contendo as informações do certificado.
 * @returns {Boolean}
 */
function exibirCertificado(resposta) {
	// Mostra informações do certificado
	//alert(resposta["informacao"]);
	var cert = eval(resposta["informacao"])[0];
	alert("Nome: " + cert.cn
			+ "\nEmail: " + cert.email
			+ "\nData de Nascimento: " + cert.dataNascimento
			+ "\nCPF: " + cert.cpf
			+ "\nTamanho da Chave: " + cert.tamanhoChave
			+ "\nAlgoritmo de Assinatura: " + cert.suiteAssinatura
			+ "\nEmitido por: " + cert.emissor
			+ "\nVálido a partir de " + cert.inicioValidade
			+ " até " + cert.fimValidade
			+ "\nRepositório " + cert.repositorio);
	return false;
}

/**
 * Função que escreve a codificação do certificado na página dinamicamente.
 * @param resposta
 */
function tratarCertificadoBase64(resposta) {
	// Seta o hidden certificado em base64 e seta a validde
	avisoExpirar(JSON.parse(resposta["certificadoJSONDefault"])["fimValidade"]);
	setValidadeCert(JSON.parse(resposta["certificadoJSONDefault"]));

	if(document.getElementById("certificado") != null) {
		document.getElementById("certificado").value = resposta["certificado"];
	}
}

/**
 * Função que busca o valor de um parâmetro tanto na página quanto nos parâmetros iniciais.
 * @param resposta Mensagem de resposta.
 */
function tratarParametro(resposta) {
	var requisicao = {};
	requisicao["comando"] = 'parametro';

	var param = resposta["parametro"];
	for ( var parametro in param) {
		var valor = "";
		try {
			var campoParametro = document.getElementsByName(param[parametro]);

			if (campoParametro != null) {
				var temp = document.getElementsByName(param[parametro])[0].value + "";
				if ((temp != null) && temp.length != 0) {
					valor = temp;
				}
			}
		} catch (exception) {
			valor = "";
		}
		requisicao[param[parametro]] = valor;
	}

	if(getParametrosInit()["assinatura_cms_lista_ids_comentarios"] != null) {
    	var res = document.getElementsByName("assinatura_cms_lista_ids_comentarios")[0].value.split(",");
    	var valores = [];
    	for(var key in res) {
    		try{
    			var valor = document.getElementById(res[key]).value;
    			requisicao[res[key]] = valor;
    		} catch(exception){
    			requisicao[res[key]] = "";
    		}
    	}
    } else if(getParametrosInit()["assinatura_pdf_lista_ids_textos"] != null) {
    	var res = document.getElementsByName("assinatura_pdf_lista_ids_textos")[0].value.split(",");
    	var valores = [];
    	for(var key in res) {
    		try{
    			var valor = document.getElementById(res[key]).value;
    			requisicao[res[key]] = valor;
    		} catch(exception){
    			requisicao[res[key]] = "";
    		}
    	}
    }

	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Envia uma mensagem para o servidor websocket no BRy Signer Web.
 * @param requisicao
 */
function enviarRequisicao(requisicao) {
	ws.send(requisicao);
}

/**
 * Função que faz o tratamento de parâmetros pelo seu ID extraído da página.
 * @param resposta Mensagem contendo um ou mais parâmetros.
 */
function tratarParametroID(resposta) {
	// Busca parâmetro pelo ID
	var requisicao = {};
	requisicao["comando"] = 'parametroID';

	var paramValor = {};

	var param = resposta["parametro"];
	for ( var parametro in param) {

		var valor = "";
		try {
			valor = document.getElementById(param[parametro]).value;
		} catch (exception) {
			valor = "";
		}

		requisicao[param[parametro]] = valor;
	}

	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Função que seta um parâmetro dinâmico pelo seu ID, caso não consiga, tenta pelo seu nome.
 * @param resposta Mensagem contendo um ou mais parâmetros.
 */
function setParametroID(resposta) {
	// setando os parâmetros da página por ID ou por name
	delete resposta.comando;

	for(var parametro in resposta) {
		try {
			document.getElementById(parametro).value = resposta[parametro];
		} catch (exception) {
			try{
				document.getElementsByName(parametro)[0].value = resposta[parametro];
			}catch(exception){
				alert("Exceção:\n" + exception);
			}
		}
	}
}

/**
 * Função chamada pelo BRy Signer Web após o término do tratamento dos dados localmente.
 */
function finalizar(ok) {
	//if(document.getElementById("form1:finalizar") != null) {
	//	document.getElementById("form1:finalizar").click();
	//}
	//alert("chama finalizarAssinatura dentro do finalizar(ok)");
	angular.element(document.getElementById('MainCtrl')).scope().finalizarAssinatura();

}

/**
 * Função chamada após o término do processo de assinatura.
 * @param resposta Função passada como parâmetro para ser chamada.
 */
function finalizarAssinatura(resposta) {
	// finalizar a assinatura
	var parametro = resposta["parametro"];
	var funcao = resposta["nomeFuncao"];

	// find object
	var fn = window[funcao];

	// is object a function?
	if (typeof fn === "function") {
		fn.apply(null, null);
	}

	//alert("chama finalizarAssinatura dentro do finalizarAssinatura(resposta)");

}

/**
 * Lista os arquivos na página.
 * @param resposta Mensagem contendo os arquivos a serem listados.
 */
function listarArquivos(resposta) {
	document.getElementById("arquivosSelecionados").value = resposta["arquivos"];
}

/**
 * Função que trata as estatísticas feitas pelo BRy Signer Web durante o processo de assinatura.
 * @param resposta Mensagem contendo as estatísticas.
 */
function tratarEstatisticas(resposta) {
	document.getElementsByName('estatisticasAssinatura')[0].value = resposta["estatistica"];
}

/**
 * Exibe um alerta na página.
 * @param resposta
 */
function exibirAlerta(resposta) {
	//alert("Teste: " + resposta["mensagem"]);
}

/**
 * Exibe o erro na página
 * @param chave
 * @param msg
 */
function alerta(chave, msg) {
	alert(msg);
}

/**
 * Função que é chamada para verificar a existência de exceção após o primeiro
 * passo na volta do framework
 */
function tratarExceptionServidor(){
	var chaveException = document.getElementById("form1:chaveException").value;
	var detalheException = document.getElementById("form1:detalheException").value;

	if(chaveException != "" && detalheException != "") {
		alerta(chaveException, detalheException);
		document.getElementById("form1:chaveException").value = "";
		document.getElementById("form1:detalheException").value = "";
	} else {
		assinarWS();
	}
}

/**
 * Função que é chamada para verificar a existência de exceção após o segundo
 * passo na volta do framework
 */
function tratarExceptionServidorTermino() {
	var chaveException = document.getElementById("form1:chaveException").value;
	var detalheException = document.getElementById("form1:detalheException").value;

	if(chaveException != "" && detalheException != "") {
		alerta(chaveException, detalheException);
		document.getElementById("form1:chaveException").value = "";
		document.getElementById("form1:detalheException").value = "";
	} else {
		retorno();
	}
}

/**
 * Exibe o texto de progresso na página.
 * @param resposta
 */
function exibeProgresso(resposta) {
	// Exibe o progresso na página
	exibirProgresso(resposta["mensagem"]);
}

/**
 * Exibe a barra de progresso na página.
 * @param resposta True para exibir a barra de progresso, false para não mostrar.
 */
function exibeBarraDeProgresso(resposta) {
	exibirBarraProgresso(resposta["mensagem"]);
}

/**
 * Define os valores de preenchimento da barra de progresso quando configurada em HTML
 * @param mensagem Mensagens vindas do BRy Signer Web que executarão a barra de progresso.
 */
function exibirProgresso(mensagem){
	/*document.getElementById("barra").value = '35';
	document.getElementById("progresso").innerHTML = mensagem;
	if(mensagem == 'Finalizando...'){
		document.getElementById("barra").value = '100';
	} else if(mensagem == 'Erro'){
		document.getElementById("barra").value = '18';
	} else if(mensagem == "Buscando LCR"){
		document.getElementById("barra").value = '29';
	} else if(mensagem == ''){
		document.getElementById("barra").value = '40';
	}else if (mensagem == "Assinatura realizada com sucesso"){
		document.getElementById("barra").value = '97';
	} else if(mensagem == 'Aguarde, a assinatura está sendo realizada.'){
		document.getElementById("barra").value = '50';
	} else if(mensagem == 'Salvando arquivo(s) localmente no diretório selecionado'){
		document.getElementById("barra").value = '90';
	} else if(mensagem == 'Exibindo estatísticas de tempo da(s) assinatura(s).'){
		document.getElementById("barra").value = '98';
	} else {
		document.getElementById("barra").value = '75';
	}*/
}

/**
 * Realiza chamada no BRy Signer Web da função que exibe o botão de procurar arquivos em
 * tela.
 */
function exibirProcurar() {
	var requisicao = {};
	requisicao["comando"] = 'filechooser';
	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Função que envia uma requisição ao BRy Signer Web para pedir que carregue uma janela de seleção de imagens.
 */
function exibirProcurarImagem() {
	var requisicao = {};
	requisicao["comando"] = 'imagem';
	ws.send(JSON.stringify(requisicao));
}

/**
 * Realiza a assinatura baseado nos parâmetros.
 */
function assinarWS() {
	console.log("Dentro assinarWS");
	var element = document.getElementById("combo_certificados");
	var valueCertificado = element.options[element.selectedIndex].value;

	var requisicao = {};
	requisicao["comando"] = 'assinarPKCS1';
	requisicao["hash"] = valueCertificado;
	try{
		requisicao[document.getElementsByName("lista_ids_entrada_dados")[0].value] = document.getElementsByName("inicializado")[0].value;
		requisicao[document.getElementsByName("lista_ids_saida_dados")[0].value] = document.getElementsByName("finalizado")[0].value;
	} catch (exception) {}
	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Função que pode ser utilizada para definir o padrão de assinatura.
 * (CMS = 1, PDF = 4, CAdES = 8, XAdES = 16)
 */
function setPadrao(valor) {
	document.getElementById("padrao").value = valor;
}

/**
 * Solicita o certificado codificado ao BRy Signer Web.
 */
function solicitaCertificado() {
	var element = document.getElementById("combo_certificados");
	var valueCertificado = element.options[element.selectedIndex].value;

	var requisicao = {};
	requisicao["comando"] = 'base64';
	requisicao["hash"] = valueCertificado;

	enviarRequisicao(JSON.stringify(requisicao));
}

/**
 * Requisita informações do certificado ao BRy Signer Web.
 */
function mostrarDetalhesWS() {
	try{
		var element = document.getElementById("combo_certificados");
		var valueCertificado = element.options[element.selectedIndex].value;

		var requisicao = {};
		requisicao["comando"] = 'certificado';
		requisicao["hash"] = valueCertificado;

		enviarRequisicao(JSON.stringify(requisicao));
	} catch(exception) {}
};

/**
 * Atualiza a lista de certificados carregada no combobox da página.
 */
function atualizarListaCertificadosWS() {
	try {
		var requisicao = {};
		requisicao["comando"] = 'certificados';
    console.log('chamando !!!!');
		enviarRequisicao(JSON.stringify(requisicao));
	} catch(exception) {}
};

/**
 * Salva a assinatura no diretório de downloads configurado do navegador pelo usuário.
 * @param assinatura Assinatura a ser salva.
 */
function salvarAssinatura(assinatura) {
	var byteArray = new Uint8Array(assinatura.length / 2);
	for (var x = 0; x < byteArray.length; x++) {
		byteArray[x] = parseInt(assinatura.substr(x * 2, 2), 16);
	}
	var textFileAsBlob = new Blob([ byteArray ], {
		type : "application/octet-stream"
	});
	var fileNameToSaveAs = "Assinatura-" + new Date() + ".p7s";

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download da Assinatura";
	if (window.webkitURL != null) {
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	} else {
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

/**
 * Tenta uma conexão websocket no endereço e porta especificado.
 * @param porta Porta de entrada em que o BRy Signer Web está esperando conexão.
 * @param funcaoErroCarregamento Função que será invocada caso ocorra algum erro durante o estabelecimento de conexão websocket.
 * @param funcaoCarregamento Função que será invocada pré-conexão websocket.
 * @param funcaoSucessoCarregamento Funçao que será invocada pós-conexão com o websocket.
 */
function inicializaWebSocket(porta, funcaoErroCarregamento, funcaoCarregamento, funcaoSucessoCarregamento) {
	if (typeof(funcaoCarregamento) == "function") {
		funcaoCarregamento();
	}
	cliente(porta, funcaoErroCarregamento, funcaoSucessoCarregamento);
};

/* *********** funções normais ************** */
/**
 * Adiciona a lista de certificados ao combobox.
 * @param Mensagem a ser adicionada ao combo.
 */
function addCertCombo(obj) {
	var certs = document.getElementById("certs");
	html = "";
	for ( var key in obj) {
		if (key != "comando") {
			html += "<option value='" + obj[key] + "'>" + key + "</option>";
		}
	}
	certs.innerHTML = html;
};

/**
 * Carrega conteúdo do arquivo a ser assinado.
 */
function carregaConteudo() {
	var file = document.getElementById("fileForUpload").files[0];
	if (file) {
		var reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onloadend = function(evt) {
			retorno = evt.target.result;
			document.getElementById("fileContents").innerHTML = retorno;
			conteudo = retorno;
		}
		reader.onerror = function(evt) {
			alert("Erro ao ler arquivo");
		}
	}
};

/**
 * Calcula o hash do documento carregado.
 * @returns
 */
function calculaHash() {
	var hashAlg = document.getElementById("hashAlg").value;
	msg = stohex(retorno);
	var md = new KJUR.crypto.MessageDigest({
		alg : hashAlg,
		prov : "cryptojs"
	});
	return md.digestHex(msg);
};

///**
// * Para o BRy Signer Web.
// */
//function paraServer() {
//	var dado = {
//		"comando" : "parar"
//	};
//	enviarRequisicao(JSON.stringify(dado));
//};

/**
 * Função que exibe um modal na página.
 */
function exibirModal() {
	$('#pleaseWaitDialog').modal();
};

/**
 * Função que fecha o modal na página.
 */
function fecharModal() {
	$('#pleaseWaitDialog').modal('hide');
};

/**
 * Busca todos os inputhidden da página pela classe.
 * @param matchClass Classe a ser buscada.
 * @returns {Array} Elementos que condizem com a classe procurada.
 */
function findByClass(matchClass) {
    var elems = document.getElementsByTagName('*');
    var resp = [];
    for (var i = 0; i < elems.length; i++) {
        if((" "+elems[i].className+" ").indexOf(" "+matchClass+" ") > -1) {
            resp.push(elems[i]);
        }
    }
    return resp;
}

/**
 * Função que busca todos os parâmetros na página contidos no inputhidden.
 * @returns {Object} Objeto contendo os nomes e valores dos campos buscados na página.
 */
function getParametrosInit() {
    var elementos = findByClass("bryws_parametro");
    var parametros = {};
    for (var i = 0; i < elementos.length; i++) {
    	parametros[elementos[i].getAttribute("name")] = elementos[i].value;
    }
    return parametros;
}

/**
 * Diferença de datas em um intervalo.
 * @param date1
 * @param date2
 * @param interval Pode ser anos, meses, semanas, dias, horas ou minutos.
 * @returns
 */
function getDateDiff(date1, date2, interval) {
	var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7;
	dateone = new Date(date1).getTime();
	datetwo = (date2) ? new Date().getTime() : new Date(date2).getTime();
	var timediff = datetwo - dateone;
	secdate = new Date(date2);
	firdate = new Date(date1);
	if (isNaN(timediff))
		return NaN;
	switch (interval) {
	case "anos":
		return secdate.getFullYear() - firdate.getFullYear();
	case "meses":
		return ((secdate.getFullYear() * 12 + secdate.getMonth()) - (firdate
				.getFullYear() * 12 + firdate.getMonth()));
	case "semanas":
		return Math.floor(timediff / week);
	case "dias":
		return Math.floor(timediff / day);
	case "horas":
		return Math.floor(timediff / hour);
	case "minutos":
		return Math.floor(timediff / minute);
	case "segundos":
		return Math.floor(timediff / second);
	default:
		return undefined;
	}
}

/**
 * Avisa quantos dias faltam para o certificado expirar de acordo com o parâmetro
 * configurado certificado_alerta_qtn_dias_expirar.
 * Caso o certificado esteja dentro do intervalo [0,certificado_alerta_qtn_dias_expirar],
 * um aviso em amarelo é escrito na tela.
 * @param dataValidade Data do certificado a ser comparada.
 */
function avisoExpirar(dataValidade) {
	if (document.getElementsByName("certificado_alerta_qtn_dias_expirar") != null) {
		try {
			var dataSplit = dataValidade.split("/");
			var dataConfigurada = dataSplit[2] + "-" + dataSplit[1] + "-" + dataSplit[0];

			var diff = getDateDiff(dataConfigurada, new Date(), 'dias');

			if(diff <= 0) {
				if(diff <= parseInt(document.getElementsByName("certificado_alerta_qtn_dias_expirar")[0].value)) {
					if (parseInt(document.getElementsByName("certificado_alerta_qtn_dias_expirar")[0].value) >= Math.abs(diff)) {
						var texto = "O certificado estará válido por mais " + Math.abs(diff) + " dias.";
						document.getElementById("expirar_id").innerHTML = "<span style='color:000000'>" + texto + "</span>";
					} else {
						document.getElementById("expirar_id").innerHTML = "";
					}
				} else {
					document.getElementById("expirar_id").innerHTML = "";
				}
			} else {
				document.getElementById("expirar_id").innerHTML = "";
			}
		} catch (exception) {
			console.log("Não foi possível configurar a data. Talvez o separado seja diferente do esperado.");
			document.getElementById("expirar_id").innerHTML = "";
		}
	}
}

/**
 * Configura com o valor recebido o algoritmo de hash utilizado na assinatura
 * @param valor
 */
function selecionarAlgoritmoAssinatura(valor) {
	try {
			if(valor == null || valor == ""){
				alert("Não é possível passar valor nulo para configuração do parâmetro de Algoritmo de Hash, " +
						"a última configuração válida será mantida");
			} else {
				document.getElementsByName("assinatura_algoritmo_hash_conteudo")[0].value = valor;
			}
		} catch(e) {
			alert("Falha: "+e);
		}
}

/**
 * Com o valor recebido, configura se a operação a ser realizada será uma assinatura, coassinatura ou contra-assinatura
 * @param valor
 */
function selecionarOperacaoAssinatura(valor) {
	document.getElementsByName("assinatura_operacao")[0].value = valor;
}

/**
 * Define o tipo da assinatura a ser realizada pelo BRy Signer Web (variável de acordo com o padrão utilizado)
 * @param valor
 */
function selecionarTipoAssinatura(valor) {
	document.getElementsByName("assinatura_tipo")[0].value = valor;
}

/**
 * Função responsável por definir a política da assinatura para padrões CAdES e XAdES
 */
function selecionarPoliticaAssinatura(valor) {
	document.getElementsByName("assinatura_cades_xades_politica")[0].value = valor;
}

function retorno() {
	//alert("Assinatura realizada com sucesso!");
}

/**
 * Função responsável por definir a versão da política da assinatura para padrões CAdES e XAdES
 */
function selecionarPoliticaVersao(valor) {
	document.getElementsByName("assinatura_cades_xades_politica_versao")[0].value = valor;
}

/**
 * Configura com o valor recebido a inclusão ou não de LCR, cadeia e carimbo de tempo na assinatura realizada.
 * @param valor
 */
function setTipoAssinaturaCMS(valor) {
	try {
		switch (valor) {
			case "0":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "false";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "false";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "false";
				break;
			case "1":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "false";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "true";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "false";
				break;
			case "2":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "true";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "false";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "false";
				break;
			case "3":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "false";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "false";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "true";
				break;
			case "4":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "true";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "true";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "false";
				break;
			case "5":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "false";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "true";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "true";
				break;
			case "6":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "true";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "false";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "true";
				break;
			case "7":
				document.getElementsByName("assinatura_incluir_cadeia")[0].value = "true";
				document.getElementsByName("assinatura_incluir_carimbo")[0].value = "true";
				document.getElementsByName("assinatura_incluir_lcr")[0].value = "true";
				break;
		}
	} catch(e) {
		alert("Falha: "+e);
	}
}

/**
 * Configura os parâmetros do pdf.
 */
function configurarPDF() {
	var dadosPDF = "dados;";
	if (document.getElementsByName("assinatura_pdf_contato")[0] != null) {
		dadosPDF += document.getElementsByName("assinatura_pdf_contato")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_local")[0] != null) {
		dadosPDF += document.getElementsByName("assinatura_pdf_local")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_razao")[0] != null) {
		dadosPDF += document.getElementsByName("assinatura_pdf_razao")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_imagem_altura_largura")[0] != null) {
		dadosPDF += document
				.getElementsByName("assinatura_pdf_imagem_altura_largura")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_imagem_posicao_x_y")[0] != null) {
		dadosPDF += document
				.getElementsByName("assinatura_pdf_imagem_posicao_x_y")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_imagem_pagina")[0] != null) {
		dadosPDF += document.getElementsByName("assinatura_pdf_imagem_pagina")[0].value;
	}
	dadosPDF += ";";
	if (document.getElementsByName("assinatura_pdf_nomes_campos_assinaturas")[0] != null) {
		dadosPDF += document
				.getElementsByName("assinatura_pdf_nomes_campos_assinaturas")[0].value;
	}
	dadosPDF += ";";
	document.getElementById("dadosPDF").value = dadosPDF;
}


function test(){
  alert('TESTE!');
}
