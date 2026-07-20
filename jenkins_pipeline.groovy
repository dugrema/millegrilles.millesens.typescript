pipeline {
    agent { label 'x86_64' }

    parameters {
        string(defaultValue: 'master', name: 'BRANCH')
        string(defaultValue: '2026.3', name: 'VERSION')
        string(defaultValue: 'jenkins-maple', name: 'CREDENTIALS_ID')
        string(defaultValue: 'ssh://git.maple.maceroc.com/git/millegrilles.millesens.typescript', name: 'GIT_URL')
        string(defaultValue: 'millegrilles_millesens_typescript', name: 'ARCHIVE_NAME')
    }

    environment {
        VBUILD="${VERSION}.${BUILD_NUMBER}"
        ARCHIVE_NAME="${params.ARCHIVE_NAME}"
    }

    stages {

        stage('react build') {
            steps {
                echo 'Build react'

                checkout scmGit(branches: [[name: params.BRANCH]], extensions: [], userRemoteConfigs: [[credentialsId: params.CREDENTIALS_ID, url: params.GIT_URL]])

                sh '''
                BUILD_DATE=`date '+%Y-%m-%d %H:%M:%S %z'`
                echo "Build date $BUILD_DATE"

                # Inject version number
                echo "Update vite.config.ts"
                sed -i "s/0\\.0\\.0-placeholder/${VBUILD}/" vite.config.ts
                sed -i "s/placeholder-date/${BUILD_DATE}/" vite.config.ts
                cat vite.config.ts
                '''

                sh '''
                echo Copier signed api mapping
                cp app/workers/apiMapping.signed.json app/workers/apiMapping.json
                '''

                sh '''
                export NODE_OPTIONS=--openssl-legacy-provider
                export CI=false

                echo "Env ---"
                printenv
                echo "---"

                npm i
                npm run build
                
                # gzip all resource files
                find build/client/ -type f \\( -name "*.js" -o -name "*.css" -o -name "*.map" -o -name "*.json" \\) -exec gzip -k {} \\;

                rm -r artifacts/ | true
                mkdir -p artifacts/
                tar -C build/client/ -zcf "artifacts/${ARCHIVE_NAME}.${VBUILD}.tar.gz" .

                . /var/lib/jenkins/venv_build2/bin/activate
                echo "Digest: "
                python3 /var/lib/jenkins/bin/runDigest.py "artifacts/${ARCHIVE_NAME}.${VBUILD}.tar.gz"
                '''

                archiveArtifacts artifacts: 'artifacts/', followSymlinks: false
                
                sh '''
                rsync artifacts/* fs1.maple.maceroc.com:archives/apps
                '''

            }
        }
    }
}
