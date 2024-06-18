npx protoc --ts_out ./generated --proto_path ./proto --ts_opt=client_grpc1 ./proto/auth.proto
npx protoc --ts_out ./generated --proto_path ./proto --ts_opt=client_grpc1 ./proto/products.proto
npx protoc --ts_out ./generated --proto_path ./proto --ts_opt=client_grpc1 ./proto/search.proto