package io.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;

public class SynchronizationService {
    public void synchronizeData(String baseURL, JsonNode nodeData, long blockHeight ) {
        try {
            JsonNode requestData = nodeData.get("requestData");
            ((ObjectNode) requestData).put("blockHeight", blockHeight);
            String requestURL = nodeData.get("requestURL").asText();
            String requestMethod = nodeData.get("requestMethod").asText();

            String query = String.format("consensus=%s", URLEncoder.encode("0", "UTF-8"));
            String urlStr = baseURL + "/" + requestURL + "?" + query;
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestMethod);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            OutputStream os = conn.getOutputStream();
            os.write(requestData.toString().getBytes());
            os.flush();
            if (conn.getResponseCode() != HttpURLConnection.HTTP_CREATED) {
                throw new RuntimeException("Failed to make a request call at " + baseURL + "with HTTP error code : "
                        + conn.getResponseCode());
            }
            BufferedReader br = new BufferedReader(new InputStreamReader(
                    (conn.getInputStream())));

            String output;
            while ((output = br.readLine()) != null) {
            }
            conn.disconnect();

        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
