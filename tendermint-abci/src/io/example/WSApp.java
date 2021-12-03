package io.example;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import io.grpc.stub.StreamObserver;
import jetbrains.exodus.ArrayByteIterable;
import jetbrains.exodus.ByteIterable;
import jetbrains.exodus.env.Environment;
import jetbrains.exodus.env.Store;
import jetbrains.exodus.env.StoreConfig;
import jetbrains.exodus.env.Transaction;
import types.ABCIApplicationGrpc;
import types.Types.*;

import java.util.Base64;

import static com.google.protobuf.ByteString.copyFrom;

class WSApp extends ABCIApplicationGrpc.ABCIApplicationImplBase {
    private Environment env;
    private Transaction txn = null;
    private Store store = null;
    private JsonNode nodeData = null;
    private SynchronizationService service;
    private String serverInfo;
    private String wsBaseURL;

    WSApp(Environment env) {
        this.env = env;
        service = new SynchronizationService();
        serverInfo = System.getenv("SERVER_INFO");
        wsBaseURL = System.getenv("WS_BASE_URL");
    }

    @Override
    public void echo(RequestEcho req, StreamObserver<ResponseEcho> responseObserver) {
        ResponseEcho resp = ResponseEcho.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void info(RequestInfo req, StreamObserver<ResponseInfo> responseObserver) {
        ResponseInfo resp = ResponseInfo.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void setOption(RequestSetOption req, StreamObserver<ResponseSetOption> responseObserver) {
        ResponseSetOption resp = ResponseSetOption.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void checkTx(RequestCheckTx req, StreamObserver<ResponseCheckTx> responseObserver) {
        ByteString tx = req.getTx();
        int code = validate(tx);
        ResponseCheckTx resp = ResponseCheckTx.newBuilder()
                .setCode(code)
                .build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void initChain(RequestInitChain req, StreamObserver<ResponseInitChain> responseObserver) {
        ResponseInitChain resp = ResponseInitChain.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
        nodeData = null;
    }

    @Override
    public void beginBlock(RequestBeginBlock req, StreamObserver<ResponseBeginBlock> responseObserver) {
        nodeData = null;
        txn = env.beginTransaction();
        store = env.openStore("store", StoreConfig.WITHOUT_DUPLICATES, txn);
        ResponseBeginBlock resp = ResponseBeginBlock.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void deliverTx(RequestDeliverTx req, StreamObserver<ResponseDeliverTx> responseObserver) {
        ByteString tx = req.getTx();
        int code = validate(tx);
        nodeData = null;
        if (code == 0) {
            // request time will be the key
            nodeData = getRootNodeTx(tx);
            Object requestTime = nodeData.get("requestTime");
            String requestTimeAsStr = requestTime.toString().replace("\"","");
            String transactionText = getDecodeTransaction(tx);

            ArrayByteIterable key = new ArrayByteIterable(requestTimeAsStr.getBytes());
            ArrayByteIterable value = new ArrayByteIterable(transactionText.getBytes());
            store.put(txn, key, value);
        }
        ResponseDeliverTx resp = ResponseDeliverTx.newBuilder()
                .setCode(code)
                .build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void endBlock(RequestEndBlock req, StreamObserver<ResponseEndBlock> responseObserver) {
        ResponseEndBlock resp = ResponseEndBlock.newBuilder().build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
        if (nodeData != null) {
            JsonNode info = nodeData.get("serverInfo");
            if (info != null && info.asInt() == Integer.parseInt(serverInfo)) {
                return;
            }
            JsonNode requestData = nodeData.get("requestData");
            String requestMethod = nodeData.get("requestMethod").asText();
            // only update the other web services if request method is POST or PUT or DELETE or PATCH
            if (req.getHeight() != 0 && txn != null && requestData != null && !requestMethod.equalsIgnoreCase("GET")) {
                service.synchronizeData(wsBaseURL, nodeData, req.getHeight());
            }
        }
    }

    @Override
    public void commit(RequestCommit req, StreamObserver<ResponseCommit> responseObserver) {
        txn.commit();
        ResponseCommit resp = ResponseCommit.newBuilder()
                .setData(copyFrom(new byte[8]))
                .build();
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void query(RequestQuery req, StreamObserver<ResponseQuery> responseObserver) {
        byte[] key = req.getData().toByteArray();
        byte[] value = getPersistedValue(key);
        ResponseQuery.Builder builder = ResponseQuery.newBuilder();
        builder.setKey(copyFrom(key));
        if (value == null) {
            builder.setLog("does not exist");
        } else {
            builder.setLog("exists");
            builder.setKey(copyFrom(key));
            builder.setValue(copyFrom(value));
        }
        responseObserver.onNext(builder.build());
        responseObserver.onCompleted();
    }

    private String getDecodeTransaction(ByteString tx) {
        byte[] bytes = tx.toByteArray();
        byte[] decode = Base64.getDecoder().decode(bytes);
        return new String(decode);
    }

    private JsonNode getRootNodeTx(ByteString tx) {
        String transactionText = getDecodeTransaction(tx);
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode node = mapper.readTree(transactionText);
            return node;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private int validate(ByteString tx) {
        JsonNode node = getRootNodeTx(tx);
        Object requestMethod = node.get("requestMethod");
        Object requestTime = node.get("requestTime");
        Object responseData = node.get("responseData");
        if(requestMethod != null && requestTime != null && responseData != null) {
            return 0;
        } else {
            return 1;
        }
    }

    private byte[] getPersistedValue(byte[] k) {
        return env.computeInReadonlyTransaction(txn -> {
            Store store = env.openStore("store", StoreConfig.WITHOUT_DUPLICATES, txn);
            ByteIterable byteIterable = store.get(txn, new ArrayByteIterable(k));
            if (byteIterable == null) {
                return null;
            }
            return byteIterable.getBytesUnsafe();
        });
    }

}
