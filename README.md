![Digitando...](https://digitando.s3.us-east-2.amazonaws.com/digitando_logo.png)

## Introdução

Digitando... é uma aplicação desenvolvida para a disciplina de Desenvolvimento de Sistemas Distribuídos com o objetivo de explorar as funcionalidades de plataformas de computação em nuvem. Para este projeto foi escolhida a Amazon Web Services (AWS).

## Aplicação

Este projeto consiste em um chat anônimo em tempo real com armazenamento persistente das mensagens que podem conter tanto textos como imagens.

A aplicação é dividida em duas partes: o backend - baseado em NodeJS, Express e Socket IO - e o fontend - criado com HTML, CSS e Vanilla JavaScript.

O backend possui três funções principais. Em primeiro lugar, ele atua servindo os arquivos estáticos do frontend. Além disso, ele possui uma API REST com dois endpoint, um para retornar todas as mensagens salvas em um banco de dados e outro para lidar com o upload de imagens. Por fim, por meio da biblioteca Socket IO, ele gerencia as conexões WebSocket (ou HTTP long polling) para a comunicação em tempo real, bidirecional e baseada em eventos.

A fim de não expor a aplicação em NodeJS diretamente para o usuário foi adicionado o Nginx para atuar como Proxy Reverso. Ele é executado em um container docker e é responsável por receber todas as conexões externas e redirecioná-las para a aplicação executada em um outro container.

Com relação ao fluxo da aplicação, quando um novo usuário se conecta ao chat ele recebe um identificador aleatório e todos os usuários online são notificados da sua chegada. Esse novo usuário terá acesso as últimas mensagens enviadas. Toda mensagem enviada no chat, seja texto ou imagem, é transmitida ao backend para serem salvas de forma permanente e todos os usuários conectados a receberão em tempo real.

Vale destacar que o gerenciamento das comunicações em tempo real foi inspirado por um [outro projeto](https://tsh.io/blog/socket-io-tutorial-real-time-communication/).

A aplicação encontra-se disponível para testes através do link abaixo:

[Demonstração](http://ec2-52-14-44-15.us-east-2.compute.amazonaws.com/)

## Infraestrutura

Para a infraestrutura foi escolhida a AWS. Os dois contêineres da aplicação são executados em uma instância da Amazon Elastic Compute Cloud (EC2) do tipo t2.micro com o sistema operacional Ubuntu 18.04.

Para o banco de dados onde todas as mensagens serão salvas, foi escolhido o Amazon Relational Database Service (RDS) com uma instância do tipo db.t2.micro executando o PostgreSQL. A comunicação entre a aplicação e o banco de dados é feita através da biblioteca [pg](https://node-postgres.com/).

Vale destacar que as imagens contidas nas mensagens não são salvas diretamente no banco de dados. Elas são primeiramente armazenadas em um bucket da Amazon Simple Storage Service (S3) e, em seguida, apenas seus links vão para o banco de dados relacional. Esse armazenamento é feito com o auxílio das bibliotecas [aws-sdk](https://aws.amazon.com/pt/sdk-for-node-js/), [multer](https://www.npmjs.com/package/multer) e [multer-s3](https://www.npmjs.com/package/multer-s3).

Abaixo é apresentado um diagrama que resume a infraestrutura do projeto.

![Infraestrutura](https://digitando.s3.us-east-2.amazonaws.com/aws_infrastructure_diagram.png)

## Deploy

Para o deploy é necessário primeiramente criar uma instância do banco de dados na Amazon RDS e configurar um bucket para armazenar as imagens na Amazon S3.

Em seguida, uma nova instância deve ser criada na Amazon EC2 e, então, este repositório deve ser clonado dentro dela.

```sh
git clone https://github.com/matheus220/digitando.git
```

> É importante destacar que o [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), o [Docker](https://docs.docker.com/engine/install/) e o [Docker Compose](https://docs.docker.com/compose/install/) devem estar instalados na máquina.

O próximo passo é configurar as variáveis de ambiente. Para isso, o arquivo [`.env.example`](https://github.com/matheus220/digitando/blob/master/server/.env.example) deve ser renomeado para `.env` e, então, devem ser informadas as credenciais para o acesso ao banco de dados

```sh
PGHOST=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGPORT=
```

e ao bucket

```sh
S3_ACCESS_KEY=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

Para inicializar a aplicação basta excutar, na raiz do projeto, o comando

```sh
docker-compose up -d
```

> Para o funcionamento correto da aplicação, as portas usadas pela aplicação devem ser liberadas nos grupos de segurança do EC2 e do RDS. As permissões do bucket também devem ser ajustadas.

A aplicação estará então disponível por meio do endereço público da instância do EC2.
