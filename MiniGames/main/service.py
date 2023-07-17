import random
import string


def generate_code():
  length = 6
  letters = string.ascii_uppercase + string.digits
  rand_string = ''.join(random.choice(letters) for i in range(length))
  return(rand_string)