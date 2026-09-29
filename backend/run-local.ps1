# Runs the backend locally without PostgreSQL, using a file-based H2 database in .localdb/.
# Secrets (TMDB_API_TOKEN, optional JWT_SECRET) are read from the git-ignored .env file in this folder.
Set-Location $PSScriptRoot

$appArgs = @(
    '--spring.datasource.url=jdbc:h2:file:./.localdb/cinecircle;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE',
    '--spring.datasource.username=sa',
    '--spring.datasource.password=',
    '--spring.jpa.hibernate.ddl-auto=update',
    '--spring.config.import=optional:file:.env[.properties]',
    '--cinecircle.tmdb.base-url=https://api.themoviedb.org/3',
    '--cinecircle.tmdb.api-token=${TMDB_API_TOKEN:}',
    '--cinecircle.jwt.secret=${JWT_SECRET:local-development-secret-change-me-please-32b}',
    '--cinecircle.jwt.expiration-hours=168'
) -join ' '

mvn -B spring-boot:run "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=$appArgs" `
    "-Dspring-boot.run.jvmArguments=-Djdk.tls.client.protocols=TLSv1.2"
