/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  return check_percent
}

function declOfNum(number, titles) {
  let cases = [2, 0, 1, 1, 1, 2];
  return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

var arraysEqual = function(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i])
      return false;
  }
  return true;
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var setStims = function() {
  curr_seq = []
  stim_array = [first_grid]
  time_array = [1000]
  var spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  var last_space = 0
  for (var i = 0; i < num_spaces; i++) {
    var space = randomDraw(spaces.filter(function(x) {return x!=last_space}))
    last_space = space
    stim_grid = '<div class="numbox numbox_'+num_spaces+'">'
    for (var j = 1; j < 26; j++) {
      if (j == space) {
        stim_grid += '<button id = button_' + j +
          ' class = "square active_smile" ><div class = content></div></button>'
      } else {
        stim_grid += '<button id = button_' + j +
          ' class = "square"><div class = content></div></button>'
      }
    }
    stim_grid += '</div>'
    curr_seq.push(space)
    stim_array.push(stim_grid)
    time_array.push(stim_time)
  }

  total_time = num_spaces * (stim_time) + 1000
}

var getTestText = function() {
  return '<div class = centerbox><div class = center-text>' + num_spaces + ' ' + declOfNum(num_spaces, ['смайлик', 'смайлика', 'смайликов']) + '</p></div>'
}

var getStims = function() {
  return stim_array
}

var setResponseStims = function(number) {
  response_grid = '<div class="numbox numbox_'+number+'">'
  for (var j = 1; j < 26; j++) {
    response_grid += '<button id = button_' + j +
        ' class = "click_square" onclick = "recordClick(this)"><div class = content></div></button>'
  }
  response_grid +=
      '<button class = clear_button id = "ClearButton" onclick = "clearResponse()">Очистить</button>' +
      '<button class = submit_button id = "SubmitButton">Подтвердить</button></div>'
}

var getResponseStims = function() {
  return response_grid
}

var getTimeArray = function() {
  return time_array
}

var getTotalTime = function() {
  return total_time
}

var getFeedback = function() {
  return '<div class = centerbox><div class = center-text>' + feedback + '</div></div>'
}

var recordClick = function(elm) {
  response.push(Number($(elm).attr('id').slice(7)))
}

var clearResponse = function() {
  response = []
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var num_spaces = 1
var num_trials = 7
var curr_seq = []
var stim_time = 1000
var time_array = []
var total_time = 0
var errors = 0
var error_lim = 3
var response = []
var enter_grid = ''
var first_grid = '<div class = numbox>'
for (var i = 1; i < 26; i++) {
  first_grid += '<button id = button_' + i +
    ' class = "square" onclick = "recordClick(this)"><div class = content></div></button>'
}
var response_grid = '<div class="numbox numbox_'+num_spaces+'">'
for (var i = 1; i < 26; i++) {
  response_grid += '<button id = button_' + i +
    ' class = "click_square" onclick = "recordClick(this)"><div class = content></div></button>'
}
response_grid +=
  '<button class = clear_button id = "ClearButton" onclick = "clearResponse()">Очистить</button>' +
  '<button class = submit_button id = "SubmitButton">Подтвердить</button></div>'
setStims()
var stim_array = getStims()

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
  questions: ['<p class = center-block-text style = "font-size: 20px">Кратко опишите, что вас просили сделать в этой задаче.</p>',
              '<p class = center-block-text style = "font-size: 20px">Есть ли у вас комментарии по поводу этой задачи?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text = 'Добро пожаловать. Нажмите <strong>Enter</strong>, чтобы начать.';
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox><p class = block-text>В этом тесте ты увидишь сетку квадратов, в которых будут появляться смайлики по одному. Твоя задача - запомнить порядок, в котором квадраты менялись на смайлики. Когда смайлики перестанут появляться, нужно будет повторить эту последовательность, нажимая мышкой на квадраты. На новых уровнях тебя ждут новые смайлики.</p></div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <strong>enter</strong> to continue.'
      return false
    }
  }
}

var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
    exp_id: 'spatial_span'
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>Finished with this task.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0
};


var start_test_block = {
  type: 'poldrack-single-stim',
  is_html: true,
  stimulus: getTestText,
  data: {
    trial_id: "test_intro"
  },
  choices: 'none',
  timing_stim: 1000,
  timing_response: 1000,
  response_ends_trial: false,
  timing_post_trial: 1000
};

var start_reverse_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "start_reverse_intro"
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = block-text>Теперь тебе надо снова запомнить последовательность появления смайликов, но воспроизвести ее в <strong>обратном</strong> порядке, то есть от последнего к первому.</p><p class = block-text>Нажмите <strong>Enter</strong>, чтобы начать.</p></div>',
  cont_key: [13],
  on_finish: function() {
  	errors = 0
    num_spaces = 1
    stims = setStims()
    responseStims = setResponseStims(num_spaces)
  }
}

/* define test block */
var test_block = {
  type: 'poldrack-multi-stim-multi-response',
  stimuli: getStims,
  is_html: true,
  timing_stim: getTimeArray,
  choices: [
    ['none']
  ],
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  timing_response: getTotalTime,
  timing_post_trial: 0,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      "sequence": curr_seq,
      "num_spaces": num_spaces
    })
  }
}


var forward_response_block = {
  type: 'single-stim-button',
  stimulus: getResponseStims,
  button_class: 'submit_button',
  data: {
    trial_id: "response",
    exp_stage: "test"
  },
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      "response": response.slice(),
      "sequence": curr_seq,
      "num_spaces": num_spaces,
      "condition": "forward"
    })
    var correct = false
      // staircase
    if (arraysEqual(response, curr_seq)) {
      num_spaces += 1
      feedback = '<span style="color:green">Верно!</span>'
      stims = setStims()
      responseStims = setResponseStims(num_spaces)
      correct = true
    } else {
      errors += 1
      if (num_spaces > 1 && errors == 2) {
        num_spaces -= 1
        errors = 0
      }
      feedback = '<span style="color:red">Неверно</span>'
      stims = setStims()
      responseStims = setResponseStims(num_spaces)
    }
    jsPsych.data.addDataToLastTrial({
      correct: correct
    })
    response = []  
  },
  timing_post_trial: 500
}

var reverse_response_block = {
  type: 'single-stim-button',
  stimulus: getResponseStims,
  button_class: 'submit_button',
  data: {
    trial_id: "response",
    exp_stage: "test"
  },
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      "response": response.slice(),
      "sequence": curr_seq,
      "num_spaces": num_spaces,
      "condition": "reverse"
    })
    var correct = false
      // staircase
    if (arraysEqual(response.reverse(), curr_seq)) {
      num_spaces += 1
      feedback = '<span style="color:green">Верно!</span>'
      stims = setStims()
      responseStims = setResponseStims(num_spaces)
      correct = true
    } else {
      errors += 1
      if (num_spaces > 1 && errors == 2) {
        num_spaces -= 1
        errors = 0
      }
      feedback = '<span style="color:red">Неверно</span>'
      stims = setStims()
      responseStims = setResponseStims(num_spaces)
    }
    jsPsych.data.addDataToLastTrial({
      correct: correct
    })
    response = []
  },
  timing_post_trial: 500
}

var feedback_block = {
  type: 'poldrack-single-stim',
  stimulus: getFeedback,
  data: {
    trial_id: "feedback",
    exp_stage: "test"
  },
  is_html: true,
  choices: 'none',
  timing_stim: 1000,
  timing_response: 1000,
  response_ends_trial: true
}

/* create experiment definition array */
var spatial_span_experiment = [];
spatial_span_experiment.push(instruction_node);
for (i = 0; i < num_trials ; i++ ) {
	spatial_span_experiment.push(start_test_block)
	spatial_span_experiment.push(test_block)
	spatial_span_experiment.push(forward_response_block)
	spatial_span_experiment.push(feedback_block)
}
spatial_span_experiment.push(attention_node)
spatial_span_experiment.push(start_reverse_block)
for (i = 0; i < num_trials ; i++ ) {
	spatial_span_experiment.push(start_test_block)
	spatial_span_experiment.push(test_block)
	spatial_span_experiment.push(reverse_response_block)
	spatial_span_experiment.push(feedback_block)
}
spatial_span_experiment.push(post_task_block)
spatial_span_experiment.push(end_block)