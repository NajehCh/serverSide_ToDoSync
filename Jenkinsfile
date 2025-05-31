pipeline {
    agent any
    environment {
        NODEJS_HOST = "ubuntu@54.243.150.44"
        DEPLOY_DIR = "/home/ubuntu/backend"
        FIREBASE_KEY = credentials('firebase-key')
    }
    triggers {
        githubPush()
    }
    stages {
        stage('Cloner le dépôt') {
            steps {
                git url: 'https://github.com/NajehCh/serverSide_ToDoSync.git', branch: 'main'
            }
        }
        stage('Installer les dépendances') {
            steps {
                echo 'Vérification de Node.js'

                sh '''
                    if ! command -v node > /dev/null 2>&1; then
                        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    else
                        echo "Node.js est déjà installé"
                    fi
                '''

                echo 'Installation des dépendances avec npm'
                sh 'npm install'
            }
        }
        stage ('Configurer la clé Firebase') {
            steps {
                withCredentials([file(credentialsId: 'firebase-key', variable: 'FIREBASE_CREDENTIALS')]) {
                    sh 'cp "$FIREBASE_CREDENTIALS" /var/lib/jenkins/workspace/serveur_deploy/src/config/serviceAccountKey.json'
                }
            }
        }
        stage ('Tests') {
            steps {
                echo "Lancement des tests avec Jest"
                sh 'npm test'
            }
        }
    stage ('Déployer sur EC2') {
        steps {
            sshagent (credentials: ['ssh-key']) {
                sh """
                    echo "Création du répertoire distant si nécessaire"
                    ssh -o StrictHostKeyChecking=no \$NODEJS_HOST 'mkdir -p ${DEPLOY_DIR}'

                    echo "Copie des fichiers du projet vers le serveur EC2"
                    scp -o StrictHostKeyChecking=no -r ./package.json ./package-lock.json ./src ./test.rest ${NODEJS_HOST}:${DEPLOY_DIR}/
                
                    echo "Connexion à EC2 pour installer les dépendances et démarrer l'application"
                    ssh -o StrictHostKeyChecking=no ${NODEJS_HOST} "bash -c '
                        cd ${DEPLOY_DIR}
                        npm install
                            if ! command -v pm2 > /dev/null; then
                                sudo npm install -g pm2
                            fi
                                pm2 stop backend || true
                                pm2 start src/config/index.js --name backend
                        ' "
                    """
            }
        }
    }
}}