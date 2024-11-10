# DocuLink

DocuLink is good

## Requirements

* javascript
* forge

## Quick start
fe 와 app 을 따로 build 해야 함

```shell
# fe
cd static/hello-world
npm install
npm run build
```

```shell
# app
npm install
forge deploy
forge install # confluence 선택후 개인 test 용 atlassian url 입력
```

### tunnel 
forge 의 deploy 와 install 을 실행한 뒤 tunnel 명령어를 사용하면 로컬 수정 사항을 실제 app 에 바로 반영 가능
```shell
forge tunnel
```
