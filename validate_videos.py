import urllib.request
import urllib.error
import time

video_data = [
    ('K2rPIbfcQHQ', 'Sliding Window'),
    ('D7LBUJA_h6k', 'Sliding Window'),
    ('oxDv8kRpf-w', 'Sliding Window'),
    ('asbcE9mZz_U', 'Prefix Sum'),
    ('fohtZQYaG1M', 'Prefix Sum'),
    ('Yt2xw7a3cRE', 'Prefix Sum'),
    ('K2BEKh-EqqA', 'Bubble/Sorting'),
    ('72g8uVt5sBE', 'Bubble/Sorting'),
    ('gHOxAnbDWCs', 'Bubble/Sorting'),
    ('PgBzjlCcFvc', 'Sorting'),
    ('xsP8K7HqA3M', 'Sorting'),
    ('vxWkqX8A3l0', 'Sorting'),
    ('K8LR4F2n4cU', 'Hashing'),
    ('nxI9QK2Xx3M', 'Hashing'),
    ('7eGmVnSsf8c', 'Hashing'),
    ('HzeK7g8cD0Y', 'Greedy'),
    ('6Hkqj8VYlXg', 'Greedy'),
    ('JYqCAdktp-4', 'Greedy'),
    ('YU1hzUwMyO8', 'Kadane\'s'),
    ('HCL4_bOd3-4', 'Kadane\'s'),
    ('Z_7rm3pfu14', 'Kadane\'s'),
    ('gm8DUJJhmY4', 'Tree Traversals'),
    ('9RHO6jU--GU', 'Tree Traversals'),
    ('lCZZXW8BBzM', 'Tree Traversals'),
    ('wjI1WNcIntg', 'Stacks/Queues'),
    ('I5lq6sA1aKk', 'Stacks/Queues'),
    ('Gq8gZg7uR0E', 'Stacks/Queues'),
    ('UKIRibZ0JEM', 'Tries'),
    ('AXjmTQ8LEoI', 'Tries'),
    ('7O5S9n7OeSk', 'Tries'),
    ('YPTqKIgVk-k', 'Top-K Elements'),
    ('0sWShKIJoo4', 'Top-K Elements'),
    ('uBI5QFvLm9E', 'Top-K Elements'),
    ('QzZ7nmouLTI', 'Two Pointers'),
    ('2TuBGzAr3lY', 'Two Pointers'),
    ('UNcNZm_dY9w', 'Two Pointers'),
    ('Kw9Jrj5T2nY', 'Union Find'),
    ('aBxjDBC4M1U', 'Union Find'),
    ('oZRSQ0coywE', 'Union Find'),
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
working = []
unavailable = []
errors = []

for i, (vid_id, module) in enumerate(video_data, 1):
    url = f'https://www.youtube.com/watch?v={vid_id}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            content = response.read().decode('utf-8', errors='ignore')
            if 'This video is unavailable' in content or 'This video isn\'t available' in content:
                unavailable.append((vid_id, module, 'DELETED'))
                print(f'[{i}/40] {vid_id} ({module}) - DELETED')
            elif 'This video is private' in content:
                unavailable.append((vid_id, module, 'PRIVATE'))
                print(f'[{i}/40] {vid_id} ({module}) - PRIVATE')
            elif 'An error occurred' in content and 'Please try again later' in content:
                unavailable.append((vid_id, module, 'RESTRICTED'))
                print(f'[{i}/40] {vid_id} ({module}) - RESTRICTED')
            else:
                working.append((vid_id, module, 'WORKING'))
                print(f'[{i}/40] {vid_id} ({module}) - WORKING')
        time.sleep(0.5)
    except urllib.error.HTTPError as e:
        errors.append((vid_id, module, f'HTTP {e.code}'))
        print(f'[{i}/40] {vid_id} ({module}) - HTTP Error {e.code}')
    except Exception as e:
        errors.append((vid_id, module, type(e).__name__))
        print(f'[{i}/40] {vid_id} ({module}) - {type(e).__name__}')
    time.sleep(0.3)

print(f'\n{"="*60}')
print(f'SUMMARY: {len(working)} Working | {len(unavailable)} Unavailable | {len(errors)} Errors')
print(f'{"="*60}')

if unavailable:
    print('\nUNAVAILABLE VIDEOS:')
    for vid, mod, status in unavailable:
        print(f'  - {vid} ({mod}) [{status}]')

if errors:
    print(f'\nERROR VIDEOS:')
    for vid, mod, err in errors:
        print(f'  - {vid} ({mod}) [{err}]')

# Write to CSV for reference
with open('video_validation_report.csv', 'w') as f:
    f.write('Video ID,Module,Status\n')
    for vid, mod, status in working:
        f.write(f'{vid},{mod},WORKING\n')
    for vid, mod, status in unavailable:
        f.write(f'{vid},{mod},{status}\n')
    for vid, mod, status in errors:
        f.write(f'{vid},{mod},{status}\n')

print('\nReport saved to video_validation_report.csv')
