FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -e -B -DskipTests package || true
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/birth-certificate-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]


