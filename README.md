# Nodeginx
Vanilla Node.js static http server

## Возможности

* Кластеризация
* Динамическая маршрутизация
* Виртуальные хосты
* Псевдонимы
* Редиректы 
* Примитивная ip-блокировка 

## Установка и запуск

Скачайте zip-архив или используйте git:
```
    git clone https://github.com/ArtemRyaguzov/nodeginx.git
```
Заходим в каталог репозитория и создаём пустой каталог для логов:
```
    mkdir -v logs
```
Запускаем:
```
    npm start
```

Перейдите по адресу http://localhost:3001/ чтобы увидеть результат: Default Page.

## Создание виртуального хоста

Так как мы запускаем сервер локально, нам необходимо добавить наши домены в файл hosts в операционной системе.

Создание виртуального хоста выглядит следующим образом. В каталоге virtual-hosts создайте файл с названием например: domain.ru.conf.js. Данный javascript-файл должен экспортировать объект виртуального хоста, выглядеть это должно примерно так: 

```javascript
    module.exports = {
        serverName: 'yourdomain.tld',
		root: '/path/to/root/directory',
		indexFile: 'index.html',
		errorPages: {
			error404: '/path/to/error/page',
		},
		logs: {
			accessLog: '/path/to/logfiles',
			errorLog: '/path/to/logfiles',
		},
    }
```

Все свойства объекта представленные в примере, включая вложенные(error404, accessLog, errorLog) являются обязательными. Их наличие проверяет функция configTest при запуске сервера.

Импортировать объект необходимо в файл include.js

```javascript
    const vh_domain = require('./virtual-hosts/domain.ru.conf');
```
Затем добавляем vh_domain в массив virtualHosts

```javascript
    const virtualHosts = [ 
	    vh_domain,
    ];
```
Чтобы убедится что все корректно добавлено мы можем вызвать функцию configTest до запуска сервера:
```
    npm run config-test
```
Ожидаемый результат: Config-test OK

Кстати! Если кастомной страницы ошибки нет, можно указать путь к файлу 404.html, который находится в каталоге default-and-error-pages.

В каталоге virtual-hosts уже создан файл example.com.conf.js, давайте эксперементировать с ним. Все что нужно это раскомментировать его в файле include.js, и если уже добавили example.com в свой файл hosts то запускаем сервер и переходим в браузере по адресу http://example.com:3001/

## Псевдонимы

Создавать псевдонимы предельно просто. Необходимо отредактировать конфигурационный файл виртуального хоста расширив значение свойства serverName новым доменным именем. Давайте создадим псевдоним привет.рф для уже знакомого нам example.com(Предварительно добавляем привет.рф в файл hosts в нашей операционной системе с ip-адресом 127.0.0.1). Заходим в каталог virtual-hosts и открываем файл example.com.conf.js. 
Добавляем новый домен в значение свойства serverName через пробел. IDN-домены следует добавлять через Punycode, примерно так:

```javascript
    module.exports = {
        serverName: 'example.com domain.ru xn--b1agh1afp.xn--p1ai', // привет.рф
		...
    }
```

## Редиректы

Перенаправления в контексте объекта виртуального хоста это массив объектов со свойствами: 
* from - какой url должен быть запрошен чтобы выполнилось перенаправление 
* to - место назначения
* statusCode - обычно указывают 301/302, 301 кэшируется браузером, в дальнейшем обращение к серверу не происходит. 302 будет обработан и перенаправлен каждый запрос.

Представим что нам нужно перенаправлять запросы поступающие на http://example.com:3001/path/to/redirect на https://www.google.com/ с кодом 301, а запросы поступающие на http://example.com:3001/another/redirect перенаправлять на https://yandex.ru/ с кодом 302. Для этого снова открываем example.com.conf.js на редактирование и добавляем массив редиректов:

```javascript
    module.exports = { 
        serverName: 'example.com domain.ru xn--b1agh1afp.xn--p1ai', 
        ...
        redirects: [
            {
                from: '/path/to/redirect',
                to: 'https://google.com',
                statusCode: 301,
            },
            {
                from: '/another/redirect',
                to: 'https://yandex.ru/',
                statusCode: 302,
            },
        ],
    }
```

redirects это опциональное свойство, то есть функция configTest не проверяет его наличие в конфиге. Также следует обратить внимание на то что в настоящий момент массовые перенаправления не поддерживаются, это значит что если в значение свойства from указать "/" то выполнять редирект будет только этот маршрут а url "/css/style.css" например, будет обрабатываться без перенаправления.

## Блокировка IP

Для блокировок существует файл generalIpBlackList.js. В массив записываются ip-адреса для которых нужно возвращать код ответа 403.

```javascript
    module.exports = [
        '127.0.0.1',
    ];
```