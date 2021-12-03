import requests
import random, time
import json

# TEST 15 Nodes
base_url = "http://localhost:6886/customers"
headers =  {"Content-Type":"application/json"}

def call_create_customer_API(consensus_param, index):
    if consensus_param == 1:
        new_customer = {
            "name": "username" + str(index + 1),
            "email": "email" + str(index + 1) + "@gmail.com",
            "address": "address" + str(index + 1)
        } 
    
    else:
        new_customer = {
            "name": "WITHOUT_CONSENSUS_" + "username" + str(index + 1),
            "email": "WITHOUT_CONSENSUS_" + "email" + str(index + 1) + "@gmail.com",
            "address": "WITHOUT_CONSENSUS_" + "address" + str(index + 1)
        }

    url = base_url + '/?consensus=' + str(consensus_param)

    t0 = time.time()
    response = requests.post(url, data=json.dumps(new_customer), headers=headers)
    if response.status_code == 201:
        t1 = time.time()
        time_taken = (t1 - t0) * 1000 #convert to milliseconds
        return time_taken, response.json()
    print("         Response error: ", response.error)
    return -1, response.error

if __name__ == "__main__":
    print('================ Evaluate time difference calling create customer POST API ================')
    average_time_without_consensus = 0;
    average_time_with_consensus = 0;
    result_file = '15_NODES_EVALUATE_POST.csv'
    with open(result_file, 'w') as file:
        file.write("No., Time without consensus(s), Time with consensus(s), End-to-end Delay, Response without consensus, Response with consensus\n")
    n_time = 200
    for i in range(n_time):
        print("================================CALLING NO.{:d}: ================================".format(i+1))
        print('================================ WITHOUT CONSENSUS ================================')
        
        time_without_consensus, response_without_consensus = call_create_customer_API(0, i)
        if(time_without_consensus < 0):
            print('Error when calling API')
        average_time_without_consensus += time_without_consensus
        print("         Time taken: {:.5f} ".format(time_without_consensus))


        print('================================ WITH CONSENSUS ================================')
        time_with_consensus, response_with_consensus = call_create_customer_API(1, i)
        if(time_with_consensus < 0):
            print('Error when calling API')
        average_time_with_consensus += time_with_consensus
        print("         Time taken: {:.5f} ".format(time_with_consensus))
        time.sleep(30)
        with open(result_file, 'a') as file:
            file.write("{:d}, {:.5f}, {:.5f}, {:.5f}, {}, {}\n".format(i+1, time_without_consensus, time_with_consensus, time_with_consensus - time_without_consensus, response_without_consensus['consensusData'], response_with_consensus['consensusData']))
    average_time_without_consensus = average_time_without_consensus / n_time
    average_time_with_consensus = average_time_with_consensus / n_time
    print('\nAVERAGE TIME TAKEN without consensus {:.5f} (seconds)'.format(average_time_without_consensus))
    print('AVERAGE TIME TAKEN with consensus {:.5f} (seconds)'.format(average_time_with_consensus))
    print('FINISHED')
    with open(result_file, 'a') as file:
            file.write("\n{}, {:.5f}, {:.5f}, {:.5f}\n".format('AVERAGE', average_time_without_consensus, average_time_with_consensus, average_time_with_consensus - average_time_without_consensus))
    